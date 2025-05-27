from rest_framework.views import APIView
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from neo4j import GraphDatabase
import json
from datetime import datetime
import os
import uuid


class Neo4jDumpView(APIView):
    def _get_driver(self):
        return GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )

    def get(self, request, *args, **kwargs):
        """Экспорт всех данных Neo4j в JSON файл"""
        if not hasattr(settings, 'NEO4J_DUMP_DIR'):
            return JsonResponse(
                {"error": "NEO4J_DUMP_DIR not configured in settings"},
                status=500
            )

        os.makedirs(settings.NEO4J_DUMP_DIR, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"neo4j_dump_{timestamp}.json"
        filepath = os.path.join(settings.NEO4J_DUMP_DIR, filename)

        try:
            driver = self._get_driver()
            export_data = {
                "nodes": [],
                "relationships": []
            }

            with driver.session() as session:
                nodes_query = "MATCH (n) RETURN n"
                nodes_result = session.run(nodes_query)

                for record in nodes_result:
                    node = record["n"]
                    node_data = {
                        "id": str(node.id),
                        "labels": list(node.labels),
                        "properties": dict(node.items())
                    }
                    export_data["nodes"].append(node_data)

                rels_query = """
                MATCH (a)-[r]->(b)
                RETURN a, r, b
                """
                rels_result = session.run(rels_query)

                for record in rels_result:
                    rel_data = {
                        "start_node_id": str(record["a"].id),
                        "end_node_id": str(record["b"].id),
                        "type": record["r"].type,
                        "properties": dict(record["r"].items())
                    }
                    export_data["relationships"].append(rel_data)

            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)

            with open(filepath, 'rb') as f:
                response = HttpResponse(
                    f.read(),
                    content_type='application/json'
                )
                response[
                    'Content-Disposition'
                ] = f'attachment; filename="{filename}"'

            return response

        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return JsonResponse({"error": str(e)}, status=500)
        finally:
            if 'driver' in locals():
                driver.close()

    def post(self, request, *args, **kwargs):
        """
        Импорт данных из JSON файла в Neo4j
        Файлу для восстановления нужно
        присвоить ключ restore_file в запросе
        """
        if 'restore_file' not in request.FILES:
            return JsonResponse(
                {"error": "No file provided"},
                status=400
            )

        uploaded_file = request.FILES['restore_file']
        temp_filepath = os.path.join(
            settings.NEO4J_DUMP_DIR,
            f"temp_import_{uuid.uuid4().hex}.json"
        )

        try:
            with open(temp_filepath, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            with open(temp_filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)

            driver = self._get_driver()

            stats = {
                "nodes_imported": 0,
                "nodes_skipped": 0,
                "relationships_imported": 0,
                "relationships_skipped": 0,
                "errors": []
            }

            with driver.session() as session:
                # Очищаем базу (опционально)
                session.run("MATCH (n) DETACH DELETE n")

                node_mapping = {}

                for node_data in data.get("nodes", []):
                    try:
                        labels = ":".join(node_data.get("labels", []))
                        query = f"""
                        CREATE (n:{labels} $props)
                        RETURN id(n) as new_id
                        """
                        result = session.run(
                            query, props=node_data.get("properties", {})
                        )
                        record = result.single()
                        node_mapping[node_data["id"]] = record["new_id"]
                        stats["nodes_imported"] += 1
                    except Exception as e:
                        stats["nodes_skipped"] += 1
                        stats["errors"].append({
                            "type": "node",
                            "id": node_data.get("id", "unknown"),
                            "error": str(e)
                        })
                        continue

                for rel_data in data.get("relationships", []):
                    try:
                        if (rel_data["start_node_id"] not in node_mapping or
                            rel_data["end_node_id"] not in node_mapping):
                            raise ValueError("One or both nodes not found")

                        query = """
                        MATCH (a), (b)
                        WHERE id(a) = $start_id AND id(b) = $end_id
                        CREATE (a)-[r:%s]->(b)
                        SET r = $props
                        """ % rel_data.get("type", "RELATED")

                        session.run(query, {
                            "start_id": node_mapping[rel_data["start_node_id"]],
                            "end_id": node_mapping[rel_data["end_node_id"]],
                            "props": rel_data.get("properties", {})
                        })
                        stats["relationships_imported"] += 1
                    except Exception as e:
                        stats["relationships_skipped"] += 1
                        stats["errors"].append({
                            "type": "relationship",
                            "start_id": rel_data.get("start_node_id", "unknown"),
                            "end_id": rel_data.get("end_node_id", "unknown"),
                            "error": str(e)
                        })
                        continue

                return JsonResponse({
                    "status": "completed",
                    "stats": stats
                })

        except Exception as e:
            return JsonResponse({
                "status": "failed",
                "error": str(e)
            }, status=500)
        finally:
            if os.path.exists(temp_filepath):
                os.remove(temp_filepath)
            if 'driver' in locals():
                driver.close()

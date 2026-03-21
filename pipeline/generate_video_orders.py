#!/usr/bin/env python3
"""
pipeline/generate_video_orders.py
Generates video_orders.json with Luma/Runway AI prompts for all 620 entries.
Run: python3 pipeline/generate_video_orders.py

Each order includes:
  - id: registry key (e.g. A_CER_001)
  - prompt: Pixar-style medical animation prompt for the AI video API
  - output_filename: destination filename for upload to Cloudflare Stream
"""

import json
import os

def build_prompt(entry):
    base = (
        f"3D Pixar-style medical animation, cinematic quality, 4K, 30-second seamless loop. "
        f"Joint group: {entry['grupo_label']}. "
        f"{entry['visual_pixar']} "
        f"Style: Visible Body anatomy transparency, warm pastel colors, no text overlays."
    )
    return base

registry_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'master-registry.json')
orders_path = os.path.join(os.path.dirname(__file__), 'video_orders.json')

with open(registry_path, encoding='utf-8') as f:
    registry = json.load(f)

orders = []
for item_id, entry in registry.items():
    # Only generate orders for entries without a Cloudflare ID yet
    if not entry.get("cloudflare_id"):
        orders.append({
            "id": item_id,
            "canal": entry["canal"],
            "grupo_articular": entry["grupo_articular"],
            "nombre_es": entry["nombre_es"],
            "prompt": build_prompt(entry),
            "output_filename": f"{item_id}.mp4"
        })

with open(orders_path, 'w', encoding='utf-8') as f:
    json.dump(orders, f, indent=2, ensure_ascii=False)

print(f"Generated {len(orders)} video orders → pipeline/video_orders.json")
print(f"  Canal A: {sum(1 for o in orders if o['canal'] == 'A')} orders")
print(f"  Canal B: {sum(1 for o in orders if o['canal'] == 'B')} orders")
print()
print("Next step: feed pipeline/video_orders.json to Luma AI / Runway API")
print("Then upload MP4s to Cloudflare Stream and update cloudflare_id in master-registry.json")

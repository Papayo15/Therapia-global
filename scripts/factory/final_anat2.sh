#!/bin/zsh
# Vista anatómica v2 (encuadre por puntos reales, pared/terapeuta no tapan): primero las prioritarias, luego el resto.
cd "$(dirname $0)/../.."
echo "=== ANAT V2 PRIO $(date)"
python3 scripts/factory/run_anat.py renders/ola1 renders/ola2 -j 3 --rehacer --ids E-016,E-017,E-020,E-021,E-032,E-033,E-036,E-040,E-042,E-043,E-045,E-047,E-049,E-054,E-055,E-058,E-061,E-064,E-067,E-069,E-071,E-074,F-CAD-003,F-CAD-006,F-CAD-008,F-CAD-012,F-CAD-017,F-CAD-022,F-CAD-024,F-CAD-027,F-CAD-028,F-CAD-029,F-CAD-030,F-CER-005,F-CER-013,F-CER-015,F-CER-018,F-COD-007,F-ESC-013,F-ESC-019,F-ESC-021,F-ESC-022,F-ESC-023,F-HOM-006,F-HOM-007,F-HOM-011,F-HOM-021,F-HOM-025,F-HOM-026,F-HOM-027,F-HOM-030,F-HOM-031,F-HOM-033,F-HOM-037,F-HOM-038,F-LUM-007,F-LUM-013,F-LUM-016,F-LUM-017,F-LUM-020,F-ROD-002,F-ROD-004,F-ROD-007,F-TOB-003,F-TOB-005,F-TOR-006,F-TOR-008,F-TOR-009,F-TOR-010,F-TOR-011,F-TOR-012,O-001,O-002,O-003,O-004,O-005,O-006,O-007,O-008,O-009,O-010,O-011,O-012,O-013,O-014,O-015,O-016,O-017,O-018,O-019,O-020,O-021,O-022,O-023,O-024,O-025,O-026,O-027,O-028,O-029,O-030,O-031,O-032,O-033,O-034,O-035,O-036,O-037,O-038,O-039,O-040,O-041,O-042,O-043,O-044,O-045,O-046,O-047,O-048,O-049,O-050,O-051,O-052,O-053,O-054,O-055,O-056,O-057,O-058,O-059,O-060,O-061,O-062,O-063,O-064,O-065,O-066,O-067,O-068,O-069,O-070,O-071,O-072,O-073,O-074,O-075,O-076,O-077,O-078,O-079,O-080,O-081,O-082,O-083,O-084,O-085,O-086,O-087,O-088,O-089,O-090,O-091,O-092,O-093,O-094
echo "=== ANAT V2 RESTO $(date)"
python3 scripts/factory/run_anat.py renders/ola1 renders/ola2 -j 3 --antes-de $(cat .corte_anat2)
rm -f renders/ola1/*/escena.blend1(N) renders/ola2/*/escena.blend1(N)
python3 scripts/factory/gallery.py renders/ola1
python3 scripts/factory/gallery.py renders/ola2
df -h . | tail -1
echo "FINAL_V2 $(date)"

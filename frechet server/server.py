from flask import Flask, request, jsonify
from flask_cors import CORS

from frechet_alg.Algorithm import CellMatrix
from frechet_alg.Geometry import Vector
from frechet_alg.Graphics import xy_to_vectors, vectors_to_xy

app = Flask(__name__)
CORS(app)


@app.route("/", methods=['POST'])
def index():
    req = request.get_json(force= True)
    print("=req= ", req)
    path_p = req['p']
    path_q = req['q']
    print("=path_p= ", path_p)
    print("=path_q= ", path_q)
    vec_p = xy_to_vectors([p['x'] for p in path_p], [p['y'] for p in path_p])
    vec_q = xy_to_vectors([q['x'] for q in path_q], [q['y'] for q in path_q])

    # calculations
    cell_matrix = CellMatrix(vec_p, vec_q, traverse = 1)

    # sampling
    sample = cell_matrix.sample_l(10, 100, heatmap_n=100)

    # lengths
    length = {'p': sample['size'][0], 'q': sample['size'][1]}

    # traversals
    traversals = [dict((k, traversal[k]) for k in ('epsilon-bounds', 'traversal-3d', 'traversal-3d-l')) for traversal in sample['traversals']]

    # cell borders
    borders_v = sample["borders-v"]
    borders_h = sample["borders-h"]
    borders = [[b[1][0].x for b in borders_v],[b[1][0].y for b in borders_h]]

    # l-lines
    l_lines = []
    for cell in sample["cells"]:
        l_lines.extend([vectors_to_xy(l[1]) for l in cell[1]['l-lines']])


    return jsonify({
        "length": length, "heatmap": sample["heatmap"],
        "bounds_l": sample["bounds-l"], "traversals": traversals,
        "borders": borders, "l_lines": l_lines})
    #    "borders-h": sample["borders-h"], "cells": sample["cells"],
    #    "cross-section-p": sample["cross-section-p"],
    #    "cross-section-q": sample["cross-section-p"]
#    });#, 'log': str(cell_matrix)})

if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, request, jsonify
from flask_cors import CORS

from frechet_alg.Algorithm import CellMatrix
from frechet_alg.Geometry import Vector
from frechet_alg.Graphics import xy_to_vectors

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

    cell_matrix = CellMatrix(vec_p, vec_q, traverse = 1)

    return jsonify({'length': {'p': 15, 'q':10}});#, 'log': str(cell_matrix)})

if __name__ == "__main__":
    app.run(debug=True)

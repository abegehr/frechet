from flask import Flask, request, jsonify
from flask_cors import CORS

from numbers import Number
from frechet_alg.Algorithm import CellMatrix
from frechet_alg.Geometry import Vector, about_equal

app = Flask(__name__)
CORS(app)


def vectors_to_xy(vectors: [Vector]) -> ([float], [float]):
    """ converts array of vectors to x- & y-coordinate arrays """
    x = []
    y = []

    for vector in vectors:
        if isinstance(vector, Vector):
            x.append(vector.x)
            y.append(vector.y)
        else:
            print("Error: not a Vector: " + str(vector))

    return x, y


def xy_to_vectors(xs: [float], ys: [float]) -> [Vector]:
    """ converts x- & y-coordinate arrays to arrays of vectors """
    vectors = []

    for i in range(min(len(xs), len(ys))):
        x = xs[i]
        y = ys[i]
        if isinstance(x, Number) and isinstance(y, Number):
            vectors.append(Vector(x, y))
        else:
            print("Error: either is not a valid float: x:" + str(x) +
                  " y:" + str(y))

    return vectors


def remove_consecutive_equals(vectors):
    return [v for i, v in enumerate(vectors) if i == 0 or v != vectors[i-1]]


@app.route("/test")
def test():
    return "test: success!"


@app.route("/", methods=['POST'])
def index():
    req = request.get_json(force=True)
    print("=req= ", req)
    path_p = req['p']
    path_q = req['q']
    print("=path_p= ", path_p)
    print("=path_q= ", path_q)
    vec_p = xy_to_vectors([p['x'] for p in path_p], [p['y'] for p in path_p])
    vec_q = xy_to_vectors([q['x'] for q in path_q], [q['y'] for q in path_q])

    # dispose consecutive equal points
    vec_p = remove_consecutive_equals(vec_p)
    vec_q = remove_consecutive_equals(vec_q)

    # calculations
    cell_matrix = CellMatrix(vec_p, vec_q, traverse=1)

    # sampling
    sample = cell_matrix.sample_l(10, 100, heatmap_n=100)

    # lengths
    lengths = {'p': sample['size'][0], 'q': sample['size'][1]}

    # traversals
    traversals = []
    for traversal in sample['traversals']:
        epsilon = traversal['traversal-3d-l'][2]
        epsilon_points = traversal['traversal-3d-l']
        # compute 3d-coords, cross section and profile of traversal
        xs = traversal['traversal-3d'][0]
        ys = traversal['traversal-3d'][1]
        zs = traversal['traversal-3d'][2]
        ts = [0]
        dts = [] # delta ts
        for i in range(1, len(xs)):
            dx = xs[i] - xs[i-1]
            dy = ys[i] - ys[i-1]
            #dz = zs[i] - zs[i-1]
            dt = max(dx, dy)
            dts.append(dt)
            ts.append(ts[i-1] + dt)
        # profiles
        profile_data = sorted(zip(dts, zs), key=lambda t: t[1], reverse=True)
        profile_ts = [0]
        profile_zs = [profile_data.pop(0)[1]]
        ddt = 0
        for _, (dt, z) in enumerate(profile_data):
            ddt += dt
            if not about_equal(profile_zs[-1], z, abs_tol=1e-6):
                profile_ts.append(profile_ts[-1] + ddt)
                profile_zs.append(z)
                ddt = 0

        traversal_dict = {
            'x': xs,
            'y': ys,
            'z': zs,
            't': ts,
            'profile': (profile_ts, profile_zs),
            'epsilon': epsilon,
            'length': ts[-1],
            'epsilon_points': epsilon_points
        }
        traversals.append(traversal_dict)

    # cell borders
    borders_v = sample["borders-v"]
    borders_h = sample["borders-h"]
    borders = [[b[1][0].x for b in borders_v], [b[1][0].y for b in borders_h]]

    # l-lines
    l_lines = []
    for cell in sample["cells"]:
        for l_vec in cell[1]['l-lines']:
            l = vectors_to_xy(l_vec[1])
            if len(l) == 2 and len(l[0]) == 2 and len(l[1]) == 2:
                l_lines.append(l)

    # critical_events
    critical_events = []
    for critical_event in sample["critical-traversals"]:
        xs, ys = vectors_to_xy(critical_event.points)
        e = critical_event.epsilon
        critical_events.append([[xs[0], xs[-1]], [ys[0], ys[-1]], e])

    return jsonify({
        "lengths": lengths, "heatmap": sample["heatmap"],
        "bounds_l": sample["bounds-l"], "traversals": traversals,
        "borders": borders, "l_lines": l_lines,
        "critical_events": critical_events})
    #    "cross-section-p": sample["cross-section-p"],
    #    "cross-section-q": sample["cross-section-p"]
    #    });#, 'log': str(cell_matrix)})


if __name__ == "__main__":
    app.run(debug=True, use_reloader=True)

from Algorithm import CellMatrix
from Geometry import *
from Graphics import PlotOutput

import sys
import csv
import getopt

"""
    -n Contours of ellipses
    -l Specific ellipses
    -s samples of drawing
"""

options, __ = getopt.getopt(sys.argv[1:], "n:l:s:")

n_heights = 7
specific_l = []
n_samples = 50

for name, value in options:
    if name == "-n":
        n_samples = int(value)
    elif name == "-l":
        specific_l = [float(val) for val in value.split(",")]
    elif name == "-s":
        n_samples = int(value)


reader = csv.reader(iter(sys.stdin.readline, ''))

paths = []

for row in reader:
    path = []
    for cell in row:
        coords = cell.split(";")
        path.append(Vector(float(coords[0]), float(coords[1])))

    paths.append(path)

    if len(paths) == 2:
        break

path_a = paths[0]
path_b = paths[1]

input1 = CellMatrix(path_a, path_b, traverse = 1)
print(input1)

#if len(specific_l) > 0:
#    sample1 = input1.sample(specific_l, n_samples)
#else:
#    sample1 = input1.sample_l(n_heights, n_samples)

traversal = input1.traversals[0]
critical_epsilons = traversal.epsilons.copy()
critical_epsilons.sort()
sample1 = input1.sample(critical_epsilons[-5:],n_samples)

#PlotOutput(sample1)
plot = PlotOutput(sample1, plot_critical_traversals=True)
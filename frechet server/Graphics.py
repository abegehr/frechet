########################################################################################################################
#                                                                                                                      #
#                                    Software Projekt: Frechet Distanz                                                 #
#                                    Teilgebiet: Ellipsen-Alg. einer Zelle                                             #
#                                    Erstellt: WS 16/17 FU Berlin                                                      #
#                                                                                                                      #
#                                    Team: Josephine Mertens, Jana Kirschner,                                          #
#                                    Alexander Korzech, Fabian Kovacs, Alexander                                       #
#                                    Timme, Kilian Kraatz & Anton Begehr                                               #
#                                                                                                                      #
########################################################################################################################

# -*- coding: utf-8 -*-

from Algorithm import *

import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm
from numbers import Number
from matplotlib.widgets import Slider


def vectors_to_xy(vectors: [Vector]) -> ([float], [float]):  # converts array of vectors to x- & y-coordinate arrays
    x = []
    y = []

    for vector in vectors:
        if isinstance(vector, Vector):
            x.append(vector.x)
            y.append(vector.y)
        else:
            print("Error: not a Vector: " + str(vector))

    return x, y


def xy_to_vectors(xs: [float], ys: [float]) -> [Vector]:  # converts x- & y-coordinate arrays to arrays of vectors
    vectors = []

    for i in range(min(len(xs), len(ys))):
        x = xs[i]
        y = ys[i]
        if isinstance(x, Number) and isinstance(y, Number):
            vectors.append(Vector(x, y))
        else:
            print("Error: either is not a valid float: x:" + str(x) + " y:" + str(y))

    return vectors


class PlotOutput:
    def __init__(self, sample, plot_borders: bool = True, plot_ellipsis: bool = True, plot_heatmap: bool = True,
                 plot_traversals: bool = True, plot_axis: bool = False, plot_l_lines: bool = False,
                 plot_3d: bool = True, show_legend: bool = True, show_colorbar: bool = True, plot_input: bool = True,
                 show_labels: bool = True, plot_critical_traversals: bool = False, plot_cross_sections: bool = False,
                 show_slider: bool = True):
        self.padding = 0.04

        self.sample = sample
        self.plot_borders = plot_borders
        self.plot_ellipsis = plot_ellipsis
        self.plot_heatmap = plot_heatmap
        self.plot_traversals = plot_traversals
        self.plot_axis = plot_axis
        self.plot_l_lines = plot_l_lines
        self.plot_3d = plot_3d
        self.show_legend = show_legend
        self.show_colorbar = show_colorbar
        self.plot_input = plot_input
        self.show_labels = show_labels
        self.plot_critical_traversals = plot_critical_traversals
        self.plot_cross_sections = plot_cross_sections
        self.show_slider = show_slider

        self.epsilon_bounds = sample["traversals"][0]["epsilon-bounds"]
        self.curr_val = 0
        self.traversal_plots_2d = []
        self.traversal_plots_3d = []

        print("\nPlotting sample.\n")

        # plot cross-sections
        if plot_cross_sections:
            self.bounds_l = sample["bounds-l"]
            fig_both = plt.figure(figsize=plt.figaspect(0.5))
            ax_hor = fig_both.add_subplot(2, 1, 1, aspect=1, ylim=self.bounds_l, xlabel="p", ylabel="ε")
            ax_ver = fig_both.add_subplot(2, 1, 2, aspect=1, ylim=self.bounds_l, xlabel="q", ylabel="ε")
            cross_sections_hor = sample["cross-sections-hor"]
            cross_sections_ver = sample["cross-sections-ver"]
            for i_q, cross_section_hor in cross_sections_hor:
                ax_hor.plot(*vectors_to_xy(cross_section_hor), label="q = " + str(i_q))
            for i_p, cross_section_ver in cross_sections_ver:
                ax_ver.plot(*vectors_to_xy(cross_section_ver), label="p = " + str(i_p))
            ax_hor.legend()
            ax_ver.legend()

        self.fig = plt.figure(figsize=plt.figaspect(0.5))
        if self.plot_3d:
            self.ax_2d = self.fig.add_subplot(1, 2, 1)
            self.ax_3d = self.fig.add_subplot(1, 2, 2, projection='3d')
        else:
            self.ax_2d = self.fig.add_subplot(1, 1, 1)
        if self.plot_input:
            fig_in = plt.figure(figsize=plt.figaspect(0.5))
            ax_in = fig_in.add_subplot(1, 1, 1)

        # show slider
        if self.show_slider and self.plot_traversals:
            ax_slider = self.fig.add_axes([0.1, 0.1, 0.8, 0.025])
            self.slider = Slider(ax_slider, '', *self.epsilon_bounds, valinit=self.epsilon_bounds[0])
            self.slider.on_changed(self.update)

        # set aspect ratio
        self.ax_2d.set_aspect('equal')
        if self.plot_3d:
            self.ax_3d.set_aspect('equal')
        if self.plot_input:
            ax_in.set_aspect('equal')

        # show axis labels
        if show_labels:
            self.ax_2d.set_xlabel("Path P")
            self.ax_2d.set_ylabel("Path Q")

            if self.plot_3d:
                self.ax_3d.set_xlabel("Path P")
                self.ax_3d.set_ylabel("Path Q")
                self.ax_3d.set_zlabel("Length l")

            if plot_input:
                ax_in.set_xlabel("X")
                ax_in.set_ylabel("Y")

        # plot input
        if plot_input:
            paths = sample["input"]
            xa, ya = np.array(vectors_to_xy(paths[0]))
            xb, yb = np.array(vectors_to_xy(paths[1]))

            ax_in.quiver(xa[:-1], ya[:-1], xa[1:] - xa[:-1], ya[1:] - ya[:-1], color="b", scale_units='xy', angles='xy',
                         scale=1)
            ax_in.quiver(xb[:-1], yb[:-1], xb[1:] - xb[:-1], yb[1:] - yb[:-1], color="c", scale_units='xy', angles='xy',
                         scale=1)

            ax_in.plot([], [], "b", label="Path P")
            ax_in.plot([], [], "c", label="Path Q")

            xlim = [min(xa.min(), xb.min()), max(xa.max(), xb.max())]
            xd = xlim[1] - xlim[0]
            xpad = xd * self.padding
            ylim = [min(ya.min(), yb.min()), max(ya.max(), yb.max())]
            yd = ylim[1] - ylim[0]
            ypad = yd * self.padding
            ax_in.axis([xlim[0] - xpad, xlim[1] + xpad, ylim[0] - ypad, ylim[1] + ypad])

            ax_in.legend()

            if plot_traversals:
                in_traversal = sample["traversals"][0]["in-traversal"]
                in_traversal_l = sample["traversals"][0]["in-traversal-l"]
                for ps in in_traversal:
                    x, y = vectors_to_xy(ps)
                    ax_in.plot(x, y, "k", linewidth=0.5)
                for ps in in_traversal_l:
                    x, y = vectors_to_xy(ps)
                    ax_in.plot(x, y, "r", linewidth=1.5)

        # set padding
        # 2d
        l_a, l_b = sample["size"]
        pad_x = self.padding * l_a
        pad_y = self.padding * l_b
        self.axis_2d = [-pad_x, l_a + pad_x, -pad_y, l_b + pad_y]
        self.ax_2d.axis(self.axis_2d)
        self.bounds_l = sample["bounds-l"]
        # 3d
        if self.plot_3d:
            dl = self.bounds_l[1] - self.bounds_l[0]
            pad_l = self.padding * dl
            self.ax_3d.axis(self.axis_2d)
            self.ax_3d.set_zlim([self.bounds_l[0] - pad_l, self.bounds_l[1] + pad_l])

        # plot 3d
        if self.plot_3d:
            heatmap = sample["heatmap"]
            x = heatmap[0]
            y = heatmap[1]
            z = heatmap[2]
            surf = self.ax_3d.plot_surface(x, y, z, cmap=cm.coolwarm, rstride=1, cstride=1,
                                           linewidth=0, antialiased=False)

        # plot borders
        if self.plot_borders:
            for border in sample["borders-v"]:
                x, y = vectors_to_xy(border[1])
                self.ax_2d.plot(x, y, "", color="0.5")
            for border in sample["borders-h"]:
                x, y = vectors_to_xy(border[1])
                self.ax_2d.plot(x, y, "", color="0.5")

        # plot cells
        for cell in sample["cells"]:
            data = cell[1]

            # plot ellipses
            if self.plot_ellipsis:
                for ellipsis_to_plot in data["ellipses"]:
                    l = ellipsis_to_plot[0]
                    if len(ellipsis_to_plot[1]) > 0:
                        x, y = vectors_to_xy(ellipsis_to_plot[1])
                        if ellipsis_to_plot[0] == 0:
                            self.ax_2d.plot(x, y, "k.")
                        else:
                            self.ax_2d.plot(x, y, "k", linewidth=0.8)
            # plot axis
            if self.plot_axis:
                for axis in data["axis"]:
                    x, y = vectors_to_xy(axis[1])
                    self.ax_2d.plot(x, y, "y:")
            # plot l-lines
            if self.plot_l_lines:
                for l_line in data["l-lines"]:
                    x, y = vectors_to_xy(l_line[1])
                    self.ax_2d.plot(x, y, "c--")

        # plot heatmap
        if self.plot_heatmap:
            heatmap = sample["heatmap"]
            x = heatmap[0]
            y = heatmap[1]
            z = heatmap[2]
            surf = self.ax_2d.pcolor(x, y, z, cmap=cm.coolwarm)

        # plot colorbar
        if self.show_colorbar:
            if self.plot_3d:
                self.fig.colorbar(surf, ax=self.ax_3d, shrink=0.95, aspect=6)
            elif self.plot_heatmap:
                self.fig.colorbar(surf, ax=self.ax_2d, shrink=0.95, aspect=6)

        # plot critical traversals
        if self.plot_critical_traversals:
            for tra in sample["critical-traversals"]:
                p1 = tra.a
                p2 = tra.b
                self.ax_2d.plot([p1.x], [p1.y], "b.")
                self.ax_2d.plot([p2.x], [p2.y], "b.")
                x, y = vectors_to_xy(tra.points)
                self.ax_2d.plot(x, y, "b--", linewidth=1.0)

        # plot traversals in 2d
        if self.plot_traversals:
            for traversal in sample["traversals"]:
                x, y, z = traversal["traversal-3d"]
                line = self.ax_2d.plot(x, y, "r", linewidth=1.5)
                self.traversal_plots_2d.append(line)

            for traversal in sample["traversals"]:
                x_l, y_l, z_l = traversal["traversal-3d-l"]
                for i in range(len(x_l)):
                    self.ax_2d.plot([x_l[i]] * 2, [y_l[i]] * 2, "ro")

        # plot traversal in 3d
        if plot_3d and plot_traversals:
            for traversal in sample["traversals"]:
                x, y, z = traversal["traversal-3d"]
                line = self.ax_3d.plot(x, y, z, "r", linewidth=0.5)
                self.traversal_plots_3d.append(line)

                x_l, y_l, z_l = traversal["traversal-3d-l"]
                for i in range(len(x_l)):
                    self.ax_3d.plot([x_l[i]] * 2, [y_l[i]] * 2, self.bounds_l, "k", linewidth=0.5)

        # show legend in 3d
        if show_legend and self.plot_3d:
            self.ax_3d.plot([], [], [], label="Frechét Distance: l=" + str(self.epsilon_bounds[1]))
            self.ax_3d.legend()

        plt.show()

    def update(self, val):
        self.curr_val = val

        if self.plot_traversals:
            print("Showing Traversals for Epsilon: " + str(val))
            self.update_traversals(val)

    def traversal_lines_above_epsilon(self, traversal, epsilon):
        x, y, z = traversal["traversal-3d"]

        x_ = []
        y_ = []
        z_ = []
        tmp_i = 0
        tmp_new_array = 0
        x_.append([])
        y_.append([])
        z_.append([])

        for i in range(len(z)):
            if z[i] > epsilon:
                if tmp_i == 0 or tmp_i == (i - 1):
                    tmp_i = i
                else:
                    tmp_new_array += 1
                    x_.append([])
                    y_.append([])
                    z_.append([])
                    tmp_i = i

                x_[tmp_new_array].append(x[i])
                y_[tmp_new_array].append(y[i])
                z_[tmp_new_array].append(z[i])

        return x_, y_, z_

    def update_traversals(self, epsilon: float):
        # remove traversal plots
        # 2d
        for traversal_plot_2d in self.traversal_plots_2d:
            traversal_plot_2d.pop().remove()
        self.traversal_plots_2d = []
        # 3d
        if self.plot_3d:
            for traversal_plot_3d in self.traversal_plots_3d:
                traversal_plot_3d.pop().remove()
            self.traversal_plots_3d = []

        # add traversal plots (above epsilon)
        for traversal in self.sample["traversals"]:
            xs, ys, zs = self.traversal_lines_above_epsilon(traversal, epsilon)

            for i in range(len(xs)):
                self.traversal_plots_2d.append(self.ax_2d.plot(xs[i], ys[i], "r", linewidth=1.5))

            # 3d
            if self.plot_3d:
                for i in range(len(xs)):
                    line = self.ax_3d.plot(xs[i], ys[i], zs[i], "r", linewidth=0.5)
                    self.traversal_plots_3d.append(line)

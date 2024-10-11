# 22.5° Refs Engine

[Access 22.5° Refs Engine](https://tancoda.github.io/22.5_refs_experiment/)

## What does it do?
Upload a crease pattern (.fold, .cp) to begin.  22.5° Refs Engine will find exact folding sequences to develop any desired reference line.  Instructions for using the program may be found in the Help menu.

## How does it work?

The vertices of the CP are stored as $[[x_0, y_0], [x_1, y_1], [x_2, y_2], … ]$, where the CP is scaled to a unit square.  The unique values are stored in a new array, and then each of these values, corresponding to the $x$ or $y$ coordinate of at least one vertex, is rewritten in the format  $\frac{a+b\sqrt{2}}{c+d\sqrt{2}}$ using the code from Jason Ku's [CP Analyze](https://github.com/origamimagiro/cp_analyze/tree/main). 

Given a vertex $\left(x_i, y_i\right)$ in the CP, then, consider the rectangle defined by the region within the unit square, and beneath the line $y=y_i$ (Figure 1).  The width-to-height ratio ($\frac{w}{h}) of this rectangle is given by the inverse of $y$ or $\left(\frac{a+b\sqrt{2}}{c+d\sqrt{2}}\right)^{-1}$, which will be rewritten as $\frac{a^\prime+b^\prime\sqrt{2}}{c^\prime}$.

![A point (x_i, y_i) within a square, and the rectangle defined beneath it](images\readme1.png "Figure 1")

22.5° Refs Engine uses crossing diagonals, emanating from the bottom left and bottom right corners of the square, to construct a point along the top of this rectangle.  The goal is to satisfy the following equation: 
$$\frac{a+b\sqrt{2}}{c}=\frac{n_1}{d_1}\times\frac{w_1}{h_1}+\frac{n_2}{d_2}\times\frac{w_2}{h_2}$$
… where $\frac{a+b\sqrt{2}}{c}$ is the width-to-height ratio of the desired reference, $\frac{n_1}{d_1}$ and $\frac{n_2}{d_2}$ are rational fractions, and $\frac{w_1}{h_1}$ and $\frac{w_2}{h_2}$ correspond to easily-folded ratios.

At our disposal are the following five, fundamental 22.5° ratios (Figure 2): $\sqrt{2}-1$, $2-\sqrt{2}$, $1$, $\frac{1+\sqrt{2}}{2}$, $\sqrt{2}+1$.  

![5 easily-folded 22.5° ratios](images\readme2.png "Figure 2")

These may be combined in ten unique ways (Figure 3).  By requiring both summands to be nonnegative, we get the conditions under which each pair may be used.

![The ten combos used for crossing diagonals](images\readme3.png "Figure 3")

Accordingly, each value stored as $\frac{a+b\sqrt{2}}{c}$ is decomposed into up to ten pairs of slopes according to this table.  Since we know how to fold the $\frac{w}{h}$ for either side, now we need to determine how to fold the $\frac{n}{d}$.

...incomplete
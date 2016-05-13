# DGMD E-27 Assignment 4
David Wihl

May 12, 2016

All assignments completed using Chrome with Mac OS.

The source files are in GitHub at [https://github.com/wihl/DGMD-E27-S16-Assignments/tree/gh-pages/assn4](https://github.com/wihl/DGMD-E27-S16-Assignments/tree/gh-pages/assn4)

## Part 1 - Flexbox

#### Part A - Flexbox Froggy.

The screenshot can be found in `flexbox/FroggyScreenShot.png`
![flexbox/FroggyScreenShot.png](flexbox/FroggyScreenShot.png)

#### Part B - Web page with Flexbox

The website for flexbox can be found in the `flexbox` directory.

All three pages (index, How It Works and Test Page) all use Flex and share a common style sheet.

The public URL can be found at [http://wihl.github.io/DGMD-E27-S16-Assignments/assn4/flexbox/](http://wihl.github.io/DGMD-E27-S16-Assignments/assn4/flexbox/)

Flexbox is used for the overall page layout and the grid system. There is also a nested flexbox on the index page for the form elements.

## Part 2 - CSS4 Grids

The public URL can be found at [http://wihl.github.io/DGMD-E27-S16-Assignments/assn4/css4grids/](http://wihl.github.io/DGMD-E27-S16-Assignments/assn4/css4grids/)

I used CSS4 auto flows to avoid having to specify precise row / column position for every element on the grid. This also allowed Bootstrap-type `col-` selectors including offsets and right justification. See the [Test page](http://wihl.github.io/DGMD-E27-S16-Assignments/assn4/css4grids/testpage.html).

All three pages use CSS4 and share a common style sheet.

Grid reordering is demonstrated in `testpage.html` line 183 and `css/chanceme.css` line 152.

There seems to be a bug in CSS4 in small mobile portrait (px < 480), as responsiveness
no longer works. This did work earlier so I'm not sure if the version of Chrome
Google released on May 11 changed anything.

## Part 3 - CSS Animation and SVG

I took [CS171](http://www.cs171.org/2016/index.html) this semester which had a large emphasis on D3 / SVG. So I combined an animated D3 / SVG [example](http://bl.ocks.org/mbostock/1353700) and added appropriate CSS Transitions and Animations.

See [http://wihl.github.io/DGMD-E27-S16-Assignments/assn4/animatesvg/index.html](http://wihl.github.io/DGMD-E27-S16-Assignments/assn4/animatesvg/index.html)

Enable the **3D transformations** by clicking on the "3D Transform" checkbox.

A **one second** color transition appears when hovering over any of the gears.

**Keyframe animation** is used twice for the counter-rotating gears in the 3D transformation.

The manipulation of an **internal SVG element** is done by hovering the inner triangle. See lines 159-164 in `index.html`.

## Thank You!

It's been a great class. I learned a tremendous amount and will certainly recommend the class to others in the future.

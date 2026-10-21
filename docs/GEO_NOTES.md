# Geography notes

## Projection

The globe uses an equirectangular projection fitted to a sphere, which is the projection that maps directly onto a UV sphere's texture coordinates. `geoEquirectangular().fitSize([2048, 1024], { type: 'Sphere' })` is used both for the land mask and for the graticule, so the texture and the 3D positions agree by construction.

The position function is:

```
phi   = (90 - lat) * pi / 180
theta = (lon + 180) * pi / 180
x = -r * sin(phi) * cos(theta)
y =  r * cos(phi)
z =  r * sin(phi) * sin(theta)
```

The `-x` and `+z` are the conventions that make east on the texture line up with east on the sphere. They are easy to get wrong; the check is that Singapore appears to the right of Africa and above Australia, not on the far side of the planet.

## The texture

- 2048 by 1024 canvas, so one pixel is about 0.176 degrees at the equator.
- Sea fills the canvas in `#0a0907`.
- Land is filled in `#1b1912`, one step above the sea.
- Internal borders are drawn in `rule` at full opacity; the outer coastline is drawn in `paper-1` at 50 percent.
- The 10 degree graticule is drawn first at 55 percent opacity, in `grat`.
- The texture is generated at runtime, not shipped as an image. That keeps the bundle smaller and lets the palette live in one place.

At 110 metres per pixel, Natural Earth's simplified countries file omits very small states. Singapore has no polygon in the texture. Its pillar still appears, because pillars use capital coordinates from the World Bank rather than polygon centroids. The same applies to a few small island states if the sample is ever extended.

## Pillar placement

Each country uses the latitude and longitude of its capital, not the centroid of its land. Capitals are where the population and the health system are concentrated, and for countries with long archipelagoes a centroid can fall in the sea. The coordinates come from the World Bank country endpoint, which returns `latitude` and `longitude` for the capital.

The pillar base sits exactly on the sphere at radius 1. The cylinder is oriented by a quaternion from the world up vector to the country's outward normal, so it stands perpendicular to the surface rather than along the y axis.

## The arc

The Singapore to Zimbabwe arc is a great circle interpolation, lifted above the surface by `0.12 + angle * 0.1`, where the angle is the central angle between the two capitals. The lift is shaped by `sin(pi t)`, so the arc leaves and meets the surface smoothly.

The outer arc is the observed gap in coral. The inner, thinner, gold arc is the share of the gap the model reproduces; it stops early because 18.88 is 83.8 percent of 22.54 (22.5 rounded). That is the one animated moment in the scene: the arc draws itself over about 1.6 seconds when the selection changes, and draws instantly under reduced motion.

## What the globe does not show

- No country fills coloured by income or life expectancy. Colour on the sphere would compete with the pillars and would need a legend the size of the panel.
- No borders as bright lines. The globe is a frame, not an atlas.
- No labels for all 42 countries. Only the selected or hovered country gets a label, and the label fades when the pillar rotates behind the sphere.
- No true area or distance. The equirectangular texture distorts near the poles, and the pillars exaggerate small countries by giving each one the same radius.

## Checks

- Zimbabwe at latitude -19.02, longitude 29.15 appears in southern Africa.
- Singapore at 1.35, 103.8 appears at the tip of the Malay peninsula.
- The arc between them crosses the Indian Ocean, not the Pacific.
- Rotating the globe 180 degrees hides the labels for the countries on the far side.
- The graticule meets at the poles without a seam.

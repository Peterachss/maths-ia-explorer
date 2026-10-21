# 3D notes

## Scene

- Sphere radius 1, 96 by 64 segments, standard material with the generated texture, roughness 1, metalness 0.
- Camera: perspective, 35 degree field of view, near 0.1, far 50, initial position `[0, 1.1, 5.4]`.
- Lights: warm ambient at 0.55, a warm directional key from the upper left at 2.4, a cool fill from the lower right at 0.35. The two lights are what give the pillars a lit side and a shadow side without a shadow map.
- Controls: orbit only, no pan, damping 0.08, distance 1.4 to 7, auto rotate at 0.25 degrees per second, disabled under reduced motion.
- Device pixel ratio capped at 2.

## Pillars

| Property | Value |
|---|---|
| Base radius | 1 (on the sphere) |
| Height | `0.025 + ((life - 50) / 36) * 0.3` globe radii |
| Range | about 0.05 at 53 years, 0.325 at 84 years |
| Shaft radius | 0.0065 |
| Cap radius | 0.012 |
| Hit target radius | 0.03, invisible, independent of the country's area |
| Colour | five stop ramp from `#ff5d5d` through `#ff9f43` and `#ffe066` to `#c9ecd8` and `#d9f1ff` |
| Selected colour | cyan `#5ad1ff` |
| Excluded | 25 percent opacity and wireframe |

The height is scaled, not proportional. A proportional mapping from zero would make every pillar taller than the planet, because life expectancy is 53 to 84 while the globe radius is 1. The scaling is stated in the caption and in `DECISIONS.md`.

The hit target is deliberately larger than the shaft. A 0.0065 radius cylinder is almost impossible to click on a trackpad, and making the target depend on the country's land area would make Singapore unselectable.

## Camera flights

The camera flies along a great circle to frame one or two countries. The distance is:

```
min(6.2, 4.2 + spread * 1.5)
```

where `spread` is the angle between the focus points in radians. For Zimbabwe and Singapore, spread is about 1.1 radians, so the distance is about 5.85. That leaves room for the pillar tips, which reach 0.325 above the surface, without cropping the sphere.

The flight eases with `1 - 2^(-10t)`, over 0.9 seconds. Under reduced motion it jumps straight to the destination.

## Labels

Drei's `Html` renders in the DOM, above the canvas, and ignores depth by default. A label for a country on the far side of the globe would therefore float beside the sphere with no visible pillar. `FacingLabel` compares the country's outward normal with the camera direction every frame and fades the label when the dot product falls below 0.12. The comparison is cheap and only runs for selected or hovered countries.

## The bowl

The least squares bowl is the sum of squared errors as a function of slope `a` and level `c` at the mean of the fitting variable. For each point:

```
e_i = y_i - (a (u_i - u_bar) + c)
SSE = sum(e_i^2)
```

The surface is a 61 by 61 plane spanning plus or minus 2.5 standard errors on each axis. The vertical scale is `min(0.9, (SSE - SSE_min) / (8 * MSE) * 0.5)`, capped so the near wall cannot fill the screen.

The minimum is marked with a small sphere. The sliders move `a` and `c`; the surface itself does not change, because the data do not change. The readout reports the current SSE as a multiple of the minimum. The point of the view is to show that the minimum is a real place with a shallow basin around it, not a magic number produced by a formula.

## What is not in 3D

- No globe rotation driven by scroll position. The camera flies, the globe stays put, which is less disorienting.
- No country polygons extruded. That would be a different, heavier scene and would make the pillar heights harder to read.
- No shadows, no environment map, no post-processing. The scene is deliberately cheap.
- No 3D text in the canvas. Labels are HTML, which keeps them crisp and accessible to the DOM.

# filterr2

In spite of poor support around `CanvasRenderingContext2D.Filter` (Safari) I've decided to rewrite `filterr` from scratch with the following goals in mind.

# Goals

- Modular filter selection. Not just a set list and order of filters to change. This will allow you to layer different filters on top of each other and in different orders to achieve more interesting effects.
- Presets. Select from a list of preset filter groups and settings to apply preset image effects. More akin to something you might see on Instagram for example.
- Saving. This complete rewrite should allow for the image to be saved after filtering it. `filterr` was all about CSS filters and as such you could not save the image after applying the filters to it.

# Relevant Links

- https://github.com/kgmmm/filterr
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter

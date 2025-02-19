# !nflect <sub>📊</sub><sup>💬</sup>
## Modulating visualizations to tell stories with data

This is a web-based template implementing inflections as a method to bridge the gap between data exploration and storytelling, by interweaving [visualization](img/#10,8,1162,1455&ff0000&&&chart_overview.png) states with narrative segments. By linking to specific views and annotations in visualizations, authors can embed insights from their data analysis within the narrative flow. 

- See the 📜<a href="https://uclab-potsdam.github.io/inflect/">Scrollytelling</a> in action, if you read this as a regular Readme
- Fork this ⚙️<a href="https://github.com/uclab-potsdam/inflect">Repository</a> to create your data story with inflected visualizations




This repository contains a template and example stories that illustrate the idea of interpretative interactions with data visualizations and other inflectable media.

Example stories
- <a href="#visualizations">visualizations</a>
- <a href="#images">images</a>
- <a href="#webpages">webpages</a>


The [folder structure](img/#0,0,369,865&ff0000&&&folder_structure.png) is quite straightforward and enables you to add inflected visualizations to your own story.



To add a new visualization to your story, we recommend using the <a href="https://vega.github.io/editor/#/examples/vega-lite/bar">Vega-Lite editor</a> to create the basic visualization.

The vega-lite spec json file can then be placed in the [/vis](img/#0,120,369,680&85eb1f&12,237,353,615&&folder_structure.png) folder.



Copy the corresponding data to the [/vis/data](img/#0,120,369,680&85eb1f&52,273,131,313&&folder_structure.png) folder.


Open the [author mode](img/#0,0,912,746&ff0000&&&inflections_editor.png) of the inflection tool by opening the inflection page in your browser.


Make sure the [vis parameter](img/#44,-51,862,336&ff0000&496,10,610,45&&inflections_editor.png) in the URL is set to the filename of your vega-lite spec.


The [UI](img/#0,0,912,746&ff0000&522,352,761,646&&inflections_editor.png
) offers some options to add annotations to your visualization.


You can use the [link emoji](img/#0,0,912,746&ff0000&814,346,863,397&&inflections_editor.png) to copy the current inflection of your visualization to your clipboard.


Create a new markdown file and add it to the [main directory](img/#0,0,369,865&85eb1f&38,660,273,852&&folder_structure.png).

To add the inflected visualization to your story, reference its URL in a paragraph to connect it to your story.



To read your story in the browser, use the hash to specify which markdown file should be parsed. You can also embed other markdown files in the current one, like this: <a href="#visualizations">#visualizations</a>




Also have a look at the [documentation image](img/#0,0,3500,7287&ff0000&&&documentation_image.png) in the img folder to find out more.


It contains further detail on the [folder structure](img/#0,192,3500,2375&ff0000&&&documentation_image.png)...


...has a [cheat sheet](img/#0,2496,3500,5582&ff0000&&&documentation_image.png) on how to use and author the repo...


...and explains how the [URL hash](img/#0,5037,3500,7656&ff0000&&&documentation_image.png) encodes the inflections.


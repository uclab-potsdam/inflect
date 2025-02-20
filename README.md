# !nflect <sub>📊</sub><sup>💬</sup>
## Modulating visualizations to tell stories with data

This is a web-based template implementing inflections as a method to bridge the gap between data exploration and storytelling, by interweaving [visualization](img/#-68,-35,1325,1741&ff0000&&&chart_overview.png) states with narrative segments. By linking to specific views and annotations in visualizations, authors can embed insights from their data analysis within the narrative flow. 

- See the 📜<a href="https://uclab-potsdam.github.io/inflect/">Scrollytelling</a> in action, if you read this as a regular Readme
- Fork this ⚙️<a href="https://github.com/uclab-potsdam/inflect">Repository</a> to create your data story with inflected visualizations




This repository contains a template and example stories that illustrate the idea of interpretative interactions with data visualizations and other inflectable media.

Example stories
- <a href="#visualizations">visualizations</a>
- <a href="#images">images</a>
- <a href="#webpages">webpages</a>


The [folder structure](img/#0,0,417,711&ff0000&&&folder_structure.png) is quite straightforward and enables you to add inflected visualizations to your own story.



To add a new visualization to your story, we recommend using the <a href="https://vega.github.io/editor/#/examples/vega-lite/bar">Vega-Lite editor</a> to create the basic visualization.

The Vega-Lite spec json file can then be placed in the [/vis](img/#0,0,417,711&ff0000&20,80,376,461&&folder_structure.png) folder.



Copy the corresponding data to the [/vis/data](img/#0,37,417,530&ff0000&52,123,149,162&&folder_structure.png) folder.


Open the [author mode](img/#0,0,1045,717&ff0000&&&inflections_editor.png) of the inflection tool by opening the inflection page in your browser.


Make sure to specify the correct json Vega-Lite spec in the [hash](img/#44,-51,862,336&ff0000&460,8,632,45&&inflections_editor.png) of the URL.


The [UI](img/#0,0,1045,717&ff0000&622,167,946,646&&inflections_editor.png
) offers some options to edit or add view changes, elements and annotations to your visualization.



Create a new markdown file and add it to the [main directory](img/#0,80,417,750&ff0000&38,510,273,710&&folder_structure.png).

To add the inflected visualization to your story, reference its URL in a paragraph to connect it to your story.



To read your story in the browser, use the hash to specify which markdown file should be parsed. You can also embed other markdown files in the current one, like this: <a href="#visualizations">#visualizations</a>




Also have a look at the [documentation image](img/#0,0,3047,8610&ff0000&&&documentation_image.png) in the img folder to find out more.


It contains further detail on the [folder structure](img/#0,0,3047,2375&ff0000&&&documentation_image.png)...


...has an [architecture overview](img/#0,1750,3047,4200&ff0000&&&documentation_image.png)...


...a [cheat sheet](img/#0,4150,3047,7200&ff0000&&&documentation_image.png) on how to use and author the repo...


...and explains how the [URL hash](img/#0,7200,3047,9000&ff0000&&&documentation_image.png) encodes the inflections.


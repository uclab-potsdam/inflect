# !nflect <sub>📊</sub><sup>💬</sup>
## Modulating Visualizations to Tell Stories with Data

!nflect is a web-based framework implementing inflections as a method to bridge the gap between data exploration and storytelling. By linking to specific views and annotations in visualizations, authors can embed insights from their data analysis within the narrative flow. 

- See <a href="https://uclab-potsdam.github.io/inflect/">scrollytelling</a> if you read this as a regular readme file
- Check out sample stories: 
<a href="https://uclab-potsdam.github.io/inflect/#visualizations">visualizations</a>, <a href="https://uclab-potsdam.github.io/inflect/#images">images</a>, <a href="https://uclab-potsdam.github.io/inflect/#webpages">webpages</a>
- Fork this <a href="https://github.com/uclab-potsdam/inflect">repository</a> to create your own data story

![img](img/#-68,-35,1325,1741&ff0000&&&chart_overview.png)


### Inf... what?

An inflection is a subtle modulation of a visualization's graphical attributes—such as zoom levels, highlights, or annotations—that guide a reader's attention and anchor interpretative insights. 

Inflections can be referenced directly in a story, so that scrolling through the text triggers transitions of the visualization state accordingly—thereby strengthening the interplay between data analysis and narrative structure.

As an exercise in inception, we highlighted the inflections visible in these Vega-Lite charts on the left.

![img](img/#-68,-35,1325,1741&00f900&1209,872,984,1017,366,65,637,598,472,1167,623,1576&1156,364,1053,352,1084,330,1051,352,1068,385,1053,348,159,1150,334,1001,329,1001,247,1001,329,1001,337,1072&chart_overview.png)


## Overview

This repository contains everything you need to host data stories with inflected visualizations on a static web server.

The two key components are:

- **Markdown** files containing the stories
- **Vega-Lite** specifications for visualizations

![img](img/#-329,-68,577,542&ff0000&&&folder_structure.png)


### Folder structure

![img](img/#-112,-43,380,315&00f900&27,8,115,132&&folder_structure.png)

If you take a closer look, you see three folders:

- `/img`: Reference images and screenshots
- `/src`: Libraries and fonts — you can ignore this one
- `/vis`: Vega-Lite specs and datasets for each chart

`/img` and `/vis` house the images and visualizations for your data story as well as the interfaces with which to inflect them.


### Story files

![img](img/#-110,119,396,489&00f900&16,312,288,448,18,178,205,223&&folder_structure.png)

The Markdown files contain the source texts for the stories. They are stored at the root level of the framework's file structure. You are currently reading the content of `README.md`, which is the default file loaded when no other story file is specified.

You can open a specific story file by adding its filename without the extension `.md` into the URL's hash. For example, the story file `visualizations.md` is opened with this URL:

<a href="#visualizations">https://uclab-potsdam.github.io/inflect/#visualizations</a>


## Getting started

![img](img/#-282,43,1333,1154&ff0000&&&steps.png)

It takes three steps to create a data story with !nflect.

To follow along, make sure that you have made a copy of this repository and can access it via webserver.


### 1. Create visualization 📊 

![img](img/#6,-54,2067,1336&ff0000&&&vega_editor.png)

- Go to the **<a href="https://vega.github.io/editor/#/examples/vega-lite/bar">Vega-Lite editor</a>** to create a basic chart
- Export the JSON spec (`.json`) and place it in `/vis`
- Copy your CSV/JSON dataset into `/vis/data` if needed

The framework currently supports bar charts, scatterplots, line charts, and pie charts.


### 2. Add inflections 💬

![img](img/#5,158,1907,1109&ff0000&&&inflections_editor.png)

- Open the **inflection editor** by navigating your browser to: `/vis/#spec_file` (without the extension `.json`)
- Interact with the chart to define your inflections, e.g., zoom or adjust scales, highlight elements, or add lines or labels
- All these changes are encoded in the URL hash. You can copy that link at any time and paste it into your Markdown story

The editor includes a reset button to remove all inflections. You can also use the browser's back button to undo any changes.


### 3. Write data story 📄

![img](img/#-41,47,1637,1204&00f900&931,171,1153,232&&scrollytelling.png) 

- Create a Markdown file (e.g., `my_story.md`) and place it in the root directory  
- Draft your narrative and embed links to inflected visualizations: `check out [this view](vis/#spec_file?hash)`
- Save and open your story in the browser with: `/#my_story` (without the extension `.md`)

As you scroll along the story text, the framework automatically modulates the visualizations in sync with the paragraphs.

The syntax is <a href="https://daringfireball.net/projects/markdown/syntax">Markdown</a> with three notable conventions: 

1. Two consecutive **empty lines** create the vertical separation between sections
2. Markdown **links** instruct the framework to update the embedded visualization. 
Regular HTML links bypass this mechanism and are rendered as simple text links.
3. Inflected **images** can be included with Markdown links or images. You can hide them from the story text, by using image tags with the `alt` attribute set to `img`: <br>
`![img](img/#parameters...)`


## At a glance

![img](img/#0,0,3047,8610&ff0000&&&documentation_image.png)

This documentation image shows the main components and mechanisms at a glance.


It contains:

![img](img/#0,0,3047,2375&ff0000&&&documentation_image.png) 
- further detail on the file structure


![img](img/#0,1750,3047,4200&ff0000&&&documentation_image.png) 
- the software architecture...


![img](img/#0,4150,3047,7200&ff0000&&&documentation_image.png) 
- a cheat sheet on how to create a data story


![img](img/#0,7200,3047,9000&ff0000&&&documentation_image.png)
- the structure of the URL hash that encodes the inflections


## Credits

The !nflect framework was developed by Theresa Eingartner and Marian Dörk in collaboration with Johanna Drucker.

The framework relies on the libraries <a href="https://d3js.org">D3.js</a>, <a href="https://vega.github.io">Vega & Vega-Lite</a>, and <a href="https://marked.js.org">Marked</a> for their visualization, interaction, and parsing powers.

The story text is rendered in <a href="https://www.brailleinstitute.org/freefont/">Atkinson Hyperlegible</a>.
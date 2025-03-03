# !nflect <sub>📊</sub><sup>💬</sup>
## Modulating Visualizations to Tell Stories with Data

!nflect is a web-based framework implementing inflections as a method to bridge the gap between data exploration and storytelling. By linking to specific views and annotations in visualizations, authors can embed insights from their data analysis within the narrative flow. 

- Open the <a href="https://uclab.fh-potsdam.de/inflect/">scrollytelling</a> version of this page
- Check out a
<a href="https://uclab.fh-potsdam.de/inflect/#visualizations">sample story</a> on visualization research
- Fork the <a href="https://github.com/uclab-potsdam/inflect">repository</a> to create your own data story

![img](img/#-430,-167,2663,2353&ff0000&&&chart_overview.png)


### Inf... what?

![img](img/#-430,-167,2663,2353&ff00d3&1445,130,1728,598,44,7,673,1005,762,1058,922,1933,1380,1130,1884,1374&&chart_overview.png)

An inflection is a subtle modulation of a visualization's graphical attributes—such as zoom levels, highlights, or annotations—that guide a reader's attention and anchor interpretative insights. 

Inflections can be referenced directly in a story, so that scrolling through the text triggers transitions of the visualization state accordingly—thereby strengthening the interplay between data analysis and narrative structure.

As an exercise in inception, we highlighted the inflections visible in these Vega-Lite charts on the left.


## Overview

The <a href="http://github.com/uclab-potsdam/inflect">!nflect repository</a> contains everything you need to host data stories with inflected visualizations on a static web server.

The two key components are:

- **Markdown** files containing the stories
- **Vega-Lite** specifications for visualizations

![img](img/#-329,-68,577,542&FF00D3&&&folder_structure.png)


### Folder structure

![img](img/#-112,-43,380,315&FF00D3&27,8,115,132&&folder_structure.png)

If you take a closer look, you see three folders:

- `/img`: Reference images and screenshots
- `/src`: Libraries and fonts — you can ignore this one
- `/vis`: Vega-Lite specs and datasets for each chart

`/img` and `/vis` house the images and visualizations included in your data story, and the interfaces with which to inflect them.


### Story files

![img](img/#-110,119,396,489&FF00D3&16,312,288,448,18,178,205,223&&folder_structure.png)

The Markdown files contain the source texts for the stories. They are stored at the root level of the framework's file structure. You are currently reading the content of `README.md`, which is the default file loaded when no other story file is specified.

You can open a specific story file by adding its filename without the extension `.md` into the URL's hash. For example, the story file `visualizations.md` is opened with this URL:

<a href="#visualizations">https://uclab.fh-potsdam.de/inflect/#visualizations</a>


## Getting started

![img](img/#-282,43,1333,1154&FF00D3&&&steps.png)

It takes three steps to create a data story:
1. Create visualization 📊 
2. Add inflections 💬
3. Write data story 📄

Typically, one iterates between them to refine the story flow, data visualizations, and inflections. 🔃

To follow along, make sure that you have made a copy of the <a href="https://github.com/uclab-potsdam/inflect">!nflect repository</a> and can access it via a webserver.


### 1. Create visualization 📊 

![img](img/#6,-54,2067,1336&FF00D3&&&vega_editor.png)

- Go to the **<a href="https://vega.github.io/editor/#/examples/vega-lite/bar">Vega-Lite editor</a>** to create a basic chart
- Export the JSON spec (`.json`) and place it in `/vis`
- Copy your CSV/JSON dataset into `/vis/data` if needed

The framework currently supports Vega-Lite bar charts, scatterplots, line charts, and pie charts.


### 2. Add inflections 💬

![img](img/#5,158,1907,1109&FF00D3&&&inflections_editor.png)

- Open the **inflection editor** by navigating your browser to: `/vis/#spec_file` (without the extension `.json`)
- Interact with the chart to define your inflections, e.g., zoom or adjust scales, highlight elements, or add lines or labels
- All these changes are encoded in the URL hash. You can copy that link at any time and paste it into your Markdown story

The editor includes a reset button to remove all inflections. You can also use the browser's back button to undo any changes.


### 3. Write data story 📄

![img](img/#-41,47,1637,1204&FF00D3&931,171,1153,232&&scrollytelling.png) 

- Create Markdown file (e.g., `my_story.md`) in root directory  
- Draft narrative and embed links to inflected visualizations:<br>`see [this view](vis/#spec_file?hash)`
- Save and open your story in the browser with: `/#my_story` (without the extension `.md`)

As you scroll along the story text, the framework automatically modulates the visualizations in sync with the paragraphs.

The syntax follows <a href="https://daringfireball.net/projects/markdown/syntax">Markdown</a> with three notable tweaks: 

1. Two blank lines start a new section
2. Regular HTML links bypass the inflection mechanism and are rendered as simple text links
3. Inflected images can be included as Markdown image elements with the `alt` attribute set to `img`: <br>
`![img](img/#parameters...)`


## All at once

![img](img/#0,0,3047,8610&FF00D3&&&documentation_image.png)

This documentation image shows the main components and mechanisms at a glance.


It contains:

![img](img/#0,0,3047,2375&FF00D3&&&documentation_image.png) 
- further detail on the file structure


![img](img/#0,1750,3047,4200&FF00D3&&&documentation_image.png) 
- the software architecture...


![img](img/#0,4150,3047,7200&FF00D3&&&documentation_image.png) 
- a cheat sheet on how to create a data story


![img](img/#0,7200,3047,9000&FF00D3&&&documentation_image.png)
- the structure of the URL hash that encodes the inflections


## Credits

![img](img/#logos.png)

**!nflect** was developed by Theresa Eingartner and Marian Dörk in collaboration with Johanna Drucker at the <a href="https://uclab.fh-potsdam.de">UCLAB</a> of <a href="https://www.fh-potsdam.de/">FH Potsdam</a>.

The framework relies on <a href="https://d3js.org">D3.js</a>, <a href="https://vega.github.io">Vega & Vega-Lite</a>, and <a href="https://marked.js.org">Marked</a> for visualization, interaction, and parsing powers.

The story text is rendered in <a href="https://www.brailleinstitute.org/freefont/">Atkinson Hyperlegible</a>.

!nflect is <a href="http://github.com/uclab-potsdam/inflect">freely available</a> under an MIT license: provided 'as is', you can use it for whatever, and the creators take no liability.

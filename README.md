# !nflect <sub>📊</sub><sup>💬</sup>
## Modulating Visualizations to Tell Stories with Data

!nflect is a web-based framework implementing inflections as a method to bridge the gap between data exploration and storytelling. By linking to specific views and annotations in visualizations, e.g., [Vega-Lite charts](img/#-68,-35,1325,1741&ff0000&&&chart_overview.png), authors can embed insights from their data analysis within the narrative flow. 

- See the 📜<a href="https://uclab-potsdam.github.io/inflect/">scrollytelling</a> in action, if you read this as a regular readme file
- Fork this ⚙️<a href="https://github.com/uclab-potsdam/inflect">repository</a> to create your data story with inflected visualizations

### Inf... what?

An inflection is a subtle modulation of a visualization's graphical attributes—such as zoom levels, highlight, or annotations—that guide a reader's attention and anchor interpretative insights. 

Inflections can be referenced directly in a story, so that scrolling through the text triggers transitions of the visualization state accordingly—thereby strengthening the interplay between data analysis and narrative structure.

Check out the sample stories:
<a href="https://uclab-potsdam.github.io/inflect/#visualizations">visualizations</a>, <a href="https://uclab-potsdam.github.io/inflect/#images">images</a>, <a href="https://uclab-potsdam.github.io/inflect/#webpages">webpages</a>.


## Overview

This repository contains everything you need to host inflected data stories on a web server. By weaving together data stories and inflected visualizations, readers are guided along a data-based narrative.

An inflected data story requires two key components:

- **Markdown** file containing the story's source text
- **Vega-Lite** specifications for interactive charts

<small>Note: You'll see references to images, for example, a screenshot of the
[folder structure](img/#-329,-68,577,542&ff0000&&&folder_structure.png).
We use images to explain the framework, but you can also inflect images themselves to zoom into certain details or add annotations to point to specific parts of images.</small>



### Folder structure

If you take a closer look at the repository's file structure, you'll see the following [key folders](img/#-112,-43,380,315&00f900&27,8,115,132&&folder_structure.png):

- `/img`: Holds reference images and screenshots
- `/src`: Contains source files of third-party libraries we rely on
- `/vis`: The place for Vega-Lite specs (`.json`) for each chart
- `/vis/data`: Houses any datasets used in the visualizations


### Story files

The [Markdown files](img/#-110,119,396,489&00f900&16,312,288,448,18,178,205,223&&folder_structure.png) are the sources for the stories. They are stored at the root level of the framework's file structure. You are currently reading the content of `README.md`, which is the default file loaded when no other story file is specified.

The framework largely follows the <a href="https://daringfireball.net/projects/markdown/syntax">Markdown syntax</a>. There are a few special conventions, such as two empty lines creating some vertical separation between sections. 
Native Markdown links, e.g.,

 `[My Chart](vis/#spec_file&hashstuff)`
 
are treated as inflection references, instructing the scrollytelling interface to update the embedded visualization states. Regular HTML links are simply displayed and linked without being loaded into the iframe. 

You can open a story file by adding its filename without the extension `.md` behind the URL's hash. For example, the story file `visualizations.md` is displayed by the !inflect framework when this URL is opened:

<a href="#visualizations">https://uclab-potsdam.github.io/inflect/#visualizations</a>




## Getting started

There are three [steps](img/#-282,43,1333,1154&ff0000&&&steps.png) of creating a data story with !nflect.


### 1. Create a visualization 📊 

- Go to the **<a href="https://vega.github.io/editor/#/examples/vega-lite/bar">Vega-Lite editor</a>** to create a basic [chart](img/#6,-54,2067,1336&ff0000&&&vega_editor.png)
- Export the JSON spec (`.json`) and place it in `/vis`
- Copy your CSV/JSON dataset into `/vis/data` if needed

The framework currently supports bar charts, scatterplots, line charts, and pie charts.


### 2. Add inflections 💬

- Open the **[inflection editor](img/#5,158,1907,1109&ff0000&&&inflections_editor.png)** by navigating your browser to: `/vis/#spec_file` (without extension `.json`)
- Interact with the chart to define your inflections, e.g., zoom or adjust scales, highlight elements, or add lines or labels
- All these changes are encoded in the URL hash. You can copy that link at any time and paste it into your Markdown story

The editor includes a reset button to remove all inflections. You can also use the browser's back button to undo any changes.


### 3. Write data story 📄

- Create a Markdown file (e.g., `my_story.md`) in the root directory  
- Draft your narrative, embedding relevant URLs, e.g., `check out [this view](vis/#spec_file?hash)`
- Save and open your story in the browser with: `/#my_story`

As you [scroll](img/#-41,47,1637,1204&00f900&931,171,1153,232&&scrollytelling.png), the !nflect framework automatically modulates the visualizations in sync with the paragraphs.


## At a glance

Also have a look at this [documentation image](img/#0,0,3047,8610&ff0000&&&documentation_image.png) to see the main components and mechanisms at a glance.


It contains:

- further detail on the [file structure](img/#0,0,3047,2375&ff0000&&&documentation_image.png)


- the software [architecture](img/#0,1750,3047,4200&ff0000&&&documentation_image.png)...


- a [cheat sheet](img/#0,4150,3047,7200&ff0000&&&documentation_image.png) on how to create a data story


- the structure of the [URL hash](img/#0,7200,3047,9000&ff0000&&&documentation_image.png) that encodes the inflections


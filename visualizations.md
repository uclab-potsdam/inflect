# Visualization research

## What are the main conferences for data visualization papers?

To answer this question, we draw upon two closely related data projects that have been tracking visualization conferences over the years: **<a href="https://sites.google.com/site/vispubdata/home">Vispubdata</a>** by Petra Isenberg et al. and **<a href="https://vispubs.com/">Vispubs</a>** by Devin Lange. While Vispubdata focuses on IEEE visualization conferences and includes citation information, Vispubs has a broader scope, incorporating EuroVis papers and those CHI papers that explicitly mention visualization (or related terms) in their title or abstract.

Let's start with Vispubdata, which covers [four conferences](vis/#IEEEvis_countPerConf&col=%23FF00D3&yax=0;2000&line=&ann=&high=), with a total of 3754 papers published since 1990.


With 1818 publications, [Vis](vis/#IEEEvis_countPerConf&col=%23FF00D3&yax=0;2000&line=InfoVis;0.7;Vis;0.8;1898.1;0;1841.1;0&ann=VAST%3B0%3B1866.6%3B0%3B1818&high=Vis;1818) appears to be the most popular conference...


You can see this even more clearly in the accompanying pie chart. Among all Vispubdata papers, [nearly half](vis/#IEEEvis_countPerConf_pie&col=%23FF00D3&line=&ann=&high=) were published at Vis.


By contrast, [SciVis](vis/#IEEEvis_countPerConf_pie&col=%23FF00D3&line=&ann=&high=305;SciVis;305) shows the fewest publications. 

What could be the reason?


Looking at the conferences [over time](vis/#IEEEvis_overTime&col=%23FF00D3&yax=0;179.6&line=&ann=&high=), we can see that SciVis ran for only a short period, and in 2021, Vis took over entirely again!


Look at the spike in [2004](vis/#IEEEvis_overTime&col=%23FF00D3&yax=0;179.6&line=2001;0.8;2003;0.7;169.6;0;172.1;0&ann=2000%3B0.7%3B165.5%3B0%3B174&high=)!


That year saw 111 papers presented at the [Vis](vis/#IEEEvis_overTime&col=%23FF00D3&yax=0;180&line=2002;0.4;2004;0.4;130.5;0;114.9;0&ann=1999%3B0.9%3B130.3%3B0%3BVis%3A%20111&high=2004;111;Vis) conference alone


If we consider only the smaller conferences between [2006-2019](vis/#IEEEvis_smallerConf), we see they published varying numbers of papers from one year to the next.


There was even a notable dip in [2013](vis/#IEEEvis_smallerConf&col=%23FF00D3&yax=0;70&xax=2009;2017&line=2013;0;2013;0;0;0;70;0&ann=&high=2013;31;SciVis), when fewer papers were published compared to surrounding years.


By switching to the Vispubs dataset, we can broaden our scope. 

Here, we combine all the papers presented at Vis, InfoVis, VAST, and SciVis under the umbrella term VIS, allowing us to [compare](vis/#vispubs_overTime) that collective set against EuroVis and CHI papers over time.


While VIS remains the primary venue for visualization-focused research, we observe a steady increase in visualization papers at CHI over the last decade. 

In 2020, the number of visualization papers presented at CHI even [surpassed](vis/#vispubs_overTime&col=%23FF00D3&yax=0;180&xax=2006;2024&line=2019.98;0;2019.99;0;0;0;180;0&ann=&high=2019.94;56.56) EuroVis.


What makes a visualization paper stand out from the crowd? [Most papers](vis/#IEEEvis_citationHisto&col=%23FF00D3&yax=0;4000&line=&ann=&high=0%20%E2%80%93%20100;3532) are referenced fewer than 100 times.


[Only a small subset](vis/#IEEEvis_citationHisto&col=%23FF00D3&yax=0;209&line=0;0;2,0;0;2,0;0;2&ann=200%3B0.8%3B33.3%3B0%3B27%2C100%3B0.9%3B176%3B0%3B172&high=) has amassed significantly higher citation counts.


Is there a [connection](vis/#IEEEvis_citeAndCited) between the number of references within a paper and the number of papers that cite it?

From the data, it doesn't appear so.


However, papers that are downloaded more often also tend to be more [cited](vis/#IEEEvis_downloadsAndCited&col=%23FF00D3&yax=0;800&xax=0;15000&line=&ann=&high=). Maybe this is to be expected. 

We do not have data on how many of the downloaded papers have been carefully read, though.


Among all these publications, ["D³ Data-Driven Documents"](vis/#IEEEvis_downloadsAndCited&col=%23FF00D3&yax=0;2200&xax=0;27985.1&line=11523.36;0;10893.95;0;1745.6;0;2028.4;0&ann=11295.1%3B0%3B1644.3%3B0%3BD³%20Data-Driven%20Documents&high=10871;2061) by Michael Bostock et al. holds the record for the most citations!


But what are all these VIS papers about? 

The [most frequent keywords](vis/#vispubs_topKeywords&col=%23FF00D3&xax=0;260.4&line=&ann=&high=) assigned by the authors offer insight into the recurring themes in the visualization community over the years.


If we remove the general terms for the respective visualization fields (e.g., information visualization, visual analytics) and focus on the [last three years](vis/#vispubs_topKeywordsRecently), we can see a clear trend of current topics in the community.


In [sum](vis/#vispubs_overTimeSum&col=%2300F05E&yax=0;280&xax=1989.99;2024&line=&ann=&high=), there has been a steady growth of visualization research published over the last 35 years. With new trends continuing to emerge, the field shows no signs of slowing down, promising further innovation in the years to come.

While this short data story focused on the main conferences, it is important to note that there is a variety of specific venues such as VISxAI, LDAV, VDS, Vis4DH, Information+, and the VIS Arts Program.

As the visualization community continues to evolve and expand, the entire gamut of visualization conferences will likely play a key role in shaping future research trends.

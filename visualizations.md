# Visualization Research

## What Are the Main Conferences for Data Visualization Papers?

To answer this question, we draw upon two closely related data projects that have been tracking visualization conferences over the years: **<a href="https://sites.google.com/site/vispubdata/home">Vispubdata</a>** by Petra Isenberg et al. and **<a href="https://vispubs.com/">Vispubs</a>** by Devin Lange. While Vispubdata focuses on IEEE visualization conferences and includes citation information, Vispubs has a broader scope, incorporating EuroVis papers and those CHI papers that explicitly mention visualization (or related terms) in their title or abstract.

[](vis/#IEEEvis_countPerConf&col=%23FF00D3&yax=0;2000&line=&ann=&high=)
Let's start with Vispubdata, which covers four conferences, with a total of 3754 papers published since 1990.

[](vis/#IEEEvis_countPerConf&col=%23FF00D3&yax=0;2000&line=InfoVis;0.7;Vis;0.8;1898.1;0;1841.1;0&ann=VAST%3B0%3B1866.6%3B0%3B1818&high=Vis;1818)
With 1818 publications, Vis appears to be the most popular conference...


You can see this even more clearly in the accompanying pie chart. Among all Vispubdata papers, [nearly half](vis/#IEEEvis_countPerConf_pie&col=%23FF00D3&line=&ann=&high=) were published at Vis.


By contrast, [SciVis](vis/#IEEEvis_countPerConf_pie&col=%23FF00D3&line=&ann=&high=305;SciVis;305) shows the fewest publications. 

What could be the reason?


[](vis/#IEEEvis_overTime&col=%23FF00D3&yax=0;179.6&line=&ann=&high=)
Looking at the conferences over time, we can see that SciVis ran for only a short period, and in 2021, Vis took over entirely again!


[](vis/#IEEEvis_overTime&col=%23FF00D3&yax=0;179.6&line=2001;0.8;2003;0.7;169.6;0;172.1;0&ann=2000%3B0.7%3B165.5%3B0%3B174&high=)
Look at the spike in 2004!


[](vis/#IEEEvis_overTime&col=%23FF00D3&yax=0;180&line=2002;0.4;2004;0.4;130.5;0;114.9;0&ann=1999%3B0.9%3B130.3%3B0%3BVis%3A%20111&high=2004;111;Vis)
That year saw 111 papers presented at the Vis conference alone


[](vis/#IEEEvis_smallerConf)
If we consider only the smaller conferences between 2006-2019, we see they published varying numbers of papers from one year to the next.


[](vis/#IEEEvis_smallerConf&col=%23FF00D3&yax=0;70&xax=2009;2017&line=2013;0;2013;0;0;0;70;0&ann=&high=2013;31;SciVis)
There was even a notable dip in 2013, when fewer papers were published compared to surrounding years.


By switching to the Vispubs dataset, we can broaden our scope. 

[](vis/#vispubs_overTime)
Here, we combine all the papers presented at Vis, InfoVis, VAST, and SciVis under the umbrella term VIS, allowing us to compare that collective set against EuroVis and CHI papers over time.


While VIS remains the primary venue for visualization-focused research, we observe a steady increase in visualization papers at CHI over the last decade. 

[](vis/#vispubs_overTime&col=%23FF00D3&yax=0;180&xax=2006;2024&line=2019.98;0;2019.99;0;0;0;180;0&ann=&high=2019.94;56.56)
In 2020, the number of visualization papers presented at CHI even surpassed EuroVis.


[](vis/#IEEEvis_citationHisto&col=%23FF00D3&yax=0;4000&line=&ann=&high=0%20%E2%80%93%20100;3532)
What makes a visualization paper stand out from the crowd? Most papers are referenced fewer than 100 times.


[](vis/#IEEEvis_citationHisto&col=%23FF00D3&yax=0;209&line=0;0;2,0;0;2,0;0;2&ann=100%3B0.9%3B176.4%3B0%3B172%7C%7C%7C200%3B0.7%3B32%3B0%3B27&high=)
Only a small subset has amassed significantly higher citation counts.


[](vis/#IEEEvis_citeAndCited)
Is there a connection between the number of references within a paper and the number of papers that cite it?

From the data, it doesn't appear so.


[](vis/#IEEEvis_downloadsAndCited&col=%23FF00D3&yax=0;800&xax=0;15000&line=&ann=&high=)
However, papers that are downloaded more often also tend to be more cited. Maybe this is to be expected. 

We do not have data on how many of the downloaded papers have been carefully read, though.


[](vis/#IEEEvis_downloadsAndCited&col=%23FF00D3&yax=0;2200&xax=0;27985.1&line=11523.36;0;10893.95;0;1745.6;0;2028.4;0&ann=11295.1%3B0%3B1644.3%3B0%3BD³%20Data-Driven%20Documents&high=10871;2061) 
Among all these publications, "D³ Data-Driven Documents" by Michael Bostock et al. holds the record for the most citations!


But what are all these VIS papers about? 

[](vis/#vispubs_topKeywords&col=%23FF00D3&xax=0;260.4&line=&ann=&high=)
The most frequent keywords assigned by the authors offer insight into the recurring themes in the visualization community over the years.


[](vis/#vispubs_topKeywordsRecently)
If we remove the general terms for the respective visualization fields (e.g., information visualization, visual analytics) and focus on the last three years, we can see a clear trend of current topics in the community.


[](vis/#vispubs_overTimeSum&col=%2300F05E&yax=0;280&xax=1989.99;2024&line=&ann=&high=)
In sum, there has been a steady growth of visualization research published over the last 35 years. With new trends continuing to emerge, the field shows no signs of slowing down, promising further innovation in the years to come.

While this short data story focused on the main conferences, it is important to note that there is a variety of specific venues such as VISxAI, LDAV, VDS, Vis4DH, Information+, and the VIS Arts Program.

As the visualization community continues to evolve and expand, the entire gamut of visualization conferences will likely play a key role in shaping future research trends.

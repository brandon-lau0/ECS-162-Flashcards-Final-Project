When we were testing our web application, we occasionally ran into an issue where when we ran the server using "node server.js", sometimes the Google Chrome cannot display our webpage properly saying "This site can't be reached. localhost refused to connect."

We figured out this this issue had to do with the cookies store in Chrome. To resolve this issue, we cleared the cookies in Google Chrome then ran the server again using "node server.js" and this fixed the issue.

So, if you ever run into this issue where our webpage won't load after you did "node server.js", we suggest to try clearing the cookies of Chrome and hopefully this will resolve the issue.

In addition, if you receive an error message that looks something like "TypeError: Cannot read property 'google_id' of undefined", then this is also related to the cookies stored in Chrome. If you clear your cookies in Chrome, this will fix the issue.

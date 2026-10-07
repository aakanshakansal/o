# Help Panel Video URL

The existing editor Help panel embeds the **Badvisor 4.0 - Tutorials** YouTube playlist.

- **Embed URL:** https://www.youtube.com/embed/videoseries?si=UlLN-lt7Jfg4IvcN&list=PLCt0SwPWx9zAjtZfULqJDbr_Dny2JEvCJ
- **Playlist URL:** https://www.youtube.com/playlist?list=PLCt0SwPWx9zAjtZfULqJDbr_Dny2JEvCJ
- **Current implementation:** [src/modules/editor/HelpPopup.jsx](modules/editor/HelpPopup.jsx)

The existing source writes `&amp;` between the URL parameters because it is JSX/HTML attribute content. When using the URL as a JavaScript string, use a normal `&`.

## React iframe example

```jsx
<iframe
	title="Badvisor 4.0 - Tutorials"
	src="https://www.youtube.com/embed/videoseries?list=PLCt0SwPWx9zAjtZfULqJDbr_Dny2JEvCJ"
	width="100%"
	height="300"
	allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
	allowFullScreen
/>
```

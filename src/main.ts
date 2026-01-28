import { Editor, Plugin } from "obsidian";

export default class SectionLinkAliaserPlugin extends Plugin {
	async onload() {
		// Automatically convert section links as they are typed
		this.registerEvent(
			this.app.workspace.on("editor-change", (editor: Editor) => {
				this.handleEditorChange(editor);
			}),
		);
	}

	/**
	 * Handle editor changes to automatically convert section links
	 */
	handleEditorChange(editor: Editor) {
		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);
		const beforeCursor = line.substring(0, cursor.ch);

		// Check if user just typed "]]" (completed a link)
		if (!beforeCursor.endsWith("]]")) {
			return;
		}

		// Find the start of the link on this line
		const linkStart = beforeCursor.lastIndexOf("[[");
		if (linkStart === -1) {
			return;
		}

		const link = beforeCursor.substring(linkStart);

		// Check if it's a section link without an alias
		const sectionLinkRegex = /^\[\[([^\]|]+?)#([^\]|]+?)\]\]$/;
		const match = link.match(sectionLinkRegex);

		if (match && match[1] && match[2]) {
			const noteName = match[1];
			const header = match[2];
			const cleanHeader = header.trim();
			const convertedLink = `[[${noteName}#${header}|${cleanHeader}]]`;

			// Replace the link on the current line
			const newLine =
				line.substring(0, linkStart) +
				convertedLink +
				line.substring(cursor.ch);
			editor.setLine(cursor.line, newLine);

			// Move cursor to the end of the converted link
			editor.setCursor({
				line: cursor.line,
				ch: linkStart + convertedLink.length,
			});
		}
	}

	onunload() {}
}

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import remark from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
	console.log('Fetching posts data...');
	// Get file names under /posts directory
	const fileNames = fs.readdirSync(postsDirectory);
	const allPostsData = fileNames.map(filename => {
		// Remove ".md" from file name to get id
		const id = filename.replace(/\.md$/, '');

		// Read markdown file as string
		const fullPath = path.join(postsDirectory, filename);
		const fileContents = fs.readFileSync(fullPath, 'utf8');

		// Use gray-matter to parse the post metadata section
		const matterResult = matter(fileContents);

		// Combine the data with id
		return {
			id,
			...matterResult.data
		};
	});

	// Sort posts by date
	return allPostsData.sort((a, b) => {
		if (a.date < b.date) {
			return 1;
		} else {
			return -1;
		}
	});
}

export function getAllPostIds() {
	const fileNames = fs.readdirSync(postsDirectory);

	return fileNames.map(fileName => ({
		params: {
			id: fileName.replace(/\.md$/, '')
		}
	}));
}

export async function getPostData(id) {
	const fullPath = path.join(postsDirectory, `${id}.md`);
	const fileContents = fs.readFileSync(fullPath, 'utf8');
	const matterResult = matter(fileContents);

	const processedContent = await remark().use(html).process(matterResult.content);

	return { 
		id, 
		contentHtml: processedContent.toString(),
		...matterResult.data 
	};
}

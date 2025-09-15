# RSS Feed Finder Examples

This document provides examples of how the RSS Feed Finder works with different types of websites.

## Example 1: Blog with Standard RSS Feed

**Website**: https://example-blog.com
**Detected Feeds**:

- https://example-blog.com/feed/ (WordPress default)
- https://example-blog.com/comments/feed/ (Comments feed)

**How it works**:

1. The content script finds the `<link rel="alternate" type="application/rss+xml" href="/feed/">` tag
2. It resolves the relative URL to an absolute URL
3. It shows a notification with the detected feed
4. When the user clicks "Add to HackerTab", the feed is added to their sources

## Example 2: News Website with Multiple Feeds

**Website**: https://news-site.com
**Detected Feeds**:

- https://news-site.com/rss/latest (Latest news)
- https://news-site.com/rss/technology (Technology section)
- https://news-site.com/rss/business (Business section)

**How it works**:

1. The content script finds multiple `<link>` tags with different feed URLs
2. It presents all detected feeds in the notification
3. The user can choose which feeds to add
4. Selected feeds are added to HackerTab with appropriate labels

## Example 3: GitHub Repository

**Website**: https://github.com/user/repo
**Detected Feeds**:

- https://github.com/user/repo/commits.atom (Commit history)
- https://github.com/user/repo/releases.atom (Release notes)
- https://github.com/user/repo/tags.atom (Tag releases)

**How it works**:

1. The content script detects Atom feeds provided by GitHub
2. It shows the notification with the detected feeds
3. The user can add the commit history feed to track repository changes

## Example 4: Podcast Website

**Website**: https://podcast-example.com
**Detected Feeds**:

- https://podcast-example.com/feed/podcast (Main podcast feed)
- https://podcast-example.com/feed/blog (Blog posts)

**How it works**:

1. The content script finds both the podcast feed and blog feed
2. Both feeds are presented to the user
3. The user can add either or both feeds to HackerTab

## Example 5: E-commerce Blog

**Website**: https://shop-example.com/blog
**Detected Feeds**:

- https://shop-example.com/blog/feed/ (Blog posts)
- https://shop-example.com/blog/comments/feed/ (Blog comments)

**How it works**:

1. The content script detects the blog's RSS feeds
2. The user can add the blog feed to stay updated on new products or announcements
3. The comments feed could be used to monitor customer feedback

## Common Feed Patterns

### WordPress Sites

Most WordPress sites have these standard feeds:

- `/feed/` - Main RSS feed
- `/comments/feed/` - Comments feed
- `/category/[name]/feed/` - Category feeds

### Medium Publications

Medium publications typically have:

- `/feed` - Main publication feed
- Individual author feeds at `/@username/feed`

### GitHub

GitHub provides Atom feeds for:

- `/commits.atom` - Commit history
- `/releases.atom` - Release notes
- `/tags.atom` - Tag releases

### Reddit

Subreddits have RSS feeds at:

- `/r/[subreddit]/.rss` - Subreddit posts
- `/r/[subreddit]/comments/[post-id]/.rss` - Post comments

## Manual Search Examples

### Finding a Specific Feed

If automatic detection doesn't find a feed, users can manually search:

1. **Enter URL**: https://example.com
2. **Common paths checked**:
   - `/rss`
   - `/rss.xml`
   - `/feed`
   - `/feed.xml`
   - `/atom.xml`

### Custom Feed URLs

Users can also directly enter custom feed URLs:

- https://example.com/custom-feed.xml
- https://api.example.com/v1/feed
- https://feeds.example.com/user/12345

## Validation Examples

### Valid RSS Feed

A valid RSS feed typically contains:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Example Feed</title>
    <link>https://example.com</link>
    <description>Example feed description</description>
    <item>
      <title>Example Item</title>
      <link>https://example.com/item</link>
      <description>Item description</description>
    </item>
  </channel>
</rss>
```

### Valid Atom Feed

A valid Atom feed typically contains:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Example Feed</title>
  <link href="https://example.com"/>
  <entry>
    <title>Example Entry</title>
    <link href="https://example.com/entry"/>
    <summary>Entry summary</summary>
  </entry>
</feed>
```

## Error Handling Examples

### Invalid Feed URL

If a feed URL returns a 404 error:

- The validation function will mark it as invalid
- The UI will show an "Invalid" status
- The user won't be able to add the feed

### Malformed XML

If a feed contains invalid XML:

- The validation function will catch the parsing error
- The UI will show an "Invalid" status
- The user will be prevented from adding the feed

### Network Errors

If there are network connectivity issues:

- The detection function will handle the error gracefully
- The user will see an appropriate error message
- The process will continue with other feeds

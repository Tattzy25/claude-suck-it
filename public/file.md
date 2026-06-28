# File
URL: /docs/ui/file

Display file message parts with icon, name, size, and download button.

> For AI agents: a documentation index is available at [llms.txt](/llms.txt). Use `.md` for canonical markdown pages; `.mdx` is kept as a backwards-compatible alias on supported URL paths.

\[interactive preview omitted]

## Getting Started

1. ### Add `file`

   ```bash
   npx shadcn@latest add https://r.assistant-ui.com/file.json
   ```

   Or install manually:

   ```bash
   npm install @assistant-ui/react class-variance-authority
   ```

   Then copy these source files from GitHub:

   - [components/assistant-ui/file.tsx](https://github.com/assistant-ui/assistant-ui/blob/main/packages/ui/src/components/assistant-ui/file.tsx)

   ```bash
   curl -sSL --create-dirs \
     -o components/assistant-ui/file.tsx https://raw.githubusercontent.com/assistant-ui/assistant-ui/main/packages/ui/src/components/assistant-ui/file.tsx
   ```

2. ### Use in your application

   Pass `File` to `MessagePrimitive.Parts`:

   ```
   import { File } from "@/components/assistant-ui/file";

   const UserMessage: FC = () => {
     return (
       <MessagePrimitive.Root className="...">
         <MessagePrimitive.Parts>
           {({ part }) => {
             if (part.type === "file") return <File {...part} />;
             return null;
           }}
         </MessagePrimitive.Parts>
       </MessagePrimitive.Root>
     );
   };
   ```

## Variants

Use the `variant` prop to change the visual style.

```
<File.Root variant="outline" /> // Border (default)
<File.Root variant="ghost" />   // No border
<File.Root variant="muted" />   // Background fill
```

## Sizes

Use the `size` prop to change padding and font size.

```
<File.Root size="sm" />      // Compact
<File.Root size="default" /> // Default
<File.Root size="lg" />      // Larger
```

## MimeType Icons

The component automatically selects an appropriate icon based on the file's MIME type:

| MIME Type          | Icon         |
| ------------------ | ------------ |
| `image/*`          | ImageIcon    |
| `application/pdf`  | FileTextIcon |
| `application/json` | BracesIcon   |
| `text/*`           | FileTextIcon |
| `audio/*`          | MusicIcon    |
| `video/*`          | VideoIcon    |
| fallback           | FileIcon     |

## API Reference

### Composable API

The component exports composable sub-components:

```
import {
  File,
  FileRoot,
  FileIconDisplay,
  FileName,
  FileSize,
  FileDownload,
} from "@/components/assistant-ui/file";

<FileRoot variant="muted" size="lg">
  <FileIconDisplay mimeType="application/pdf" />
  <div className="flex flex-col gap-0.5">
    <FileName>report.pdf</FileName>
    <FileSize bytes={2048} className="text-xs" />
  </div>
  <FileDownload
    data="SGVsbG8gV29ybGQh"
    mimeType="application/pdf"
    filename="report.pdf"
  />
</FileRoot>
```

| Component       | Description                                     |
| --------------- | ----------------------------------------------- |
| `File`          | Default export, renders complete file part      |
| `File.Root`     | Container with variant and size styling         |
| `File.Icon`     | MIME type-aware icon, or pass custom `children` |
| `File.Name`     | Truncated filename                              |
| `File.Size`     | Human-readable file size                        |
| `File.Download` | Download link button                            |

### Custom Icon

Pass `children` to `File.Icon` to override the default MIME type icon:

```
<File.Icon>
  <MyCustomIcon className="size-5" />
</File.Icon>
```

## Utilities

The component also exports utility functions:

```
import {
  getMimeTypeIcon,
  getBase64Size,
  formatFileSize,
} from "@/components/assistant-ui/file";

// Get icon component for a MIME type
const Icon = getMimeTypeIcon("application/pdf"); // FileTextIcon

// Calculate size from base64 string
const bytes = getBase64Size("SGVsbG8gV29ybGQh"); // 12

// Format bytes to human-readable
const size = formatFileSize(2048); // "2.0 KB"
```

## Related Components

- [Image](/docs/ui/image) - Image message parts
- [Attachment](/docs/ui/attachment) - File attachments in composer and messages
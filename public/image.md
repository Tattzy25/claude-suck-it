# Image
URL: /docs/ui/image

Display image message parts with preview, loading states, and fullscreen dialog.

> For AI agents: a documentation index is available at [llms.txt](/llms.txt). Use `.md` for canonical markdown pages; `.mdx` is kept as a backwards-compatible alias on supported URL paths.

\[interactive preview omitted]

## Getting Started

1. ### Add `image`

   ```bash
   npx shadcn@latest add https://r.assistant-ui.com/image.json
   ```

   Or install manually:

   ```bash
   npm install @assistant-ui/react class-variance-authority
   ```

   Then copy these source files from GitHub:

   - [components/assistant-ui/image.tsx](https://github.com/assistant-ui/assistant-ui/blob/main/packages/ui/src/components/assistant-ui/image.tsx)

   ```bash
   curl -sSL --create-dirs \
     -o components/assistant-ui/image.tsx https://raw.githubusercontent.com/assistant-ui/assistant-ui/main/packages/ui/src/components/assistant-ui/image.tsx
   ```

2. ### Use in your application

   Pass `Image` to `MessagePrimitive.Parts`:

   ```
   import { Image } from "@/components/assistant-ui/image";

   const AssistantMessage: FC = () => {
     return (
       <MessagePrimitive.Root className="...">
         <MessagePrimitive.Parts>
           {({ part }) => {
             if (part.type === "image") return <Image {...part} />;
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
<Image.Root variant="outline" /> // Border (default)
<Image.Root variant="ghost" />   // No border
<Image.Root variant="muted" />   // Background fill
```

## Sizes

Use the `size` prop to control the maximum width.

```
<Image.Root size="sm" />      // max-w-64 (256px)
<Image.Root size="default" /> // max-w-96 (384px)
<Image.Root size="lg" />      // max-w-[512px]
<Image.Root size="full" />    // w-full
```

## API Reference

### Composable API

The component exports composable sub-components:

```
import {
  Image,
  ImageRoot,
  ImagePreview,
  ImageFilename,
  ImageZoom,
} from "@/components/assistant-ui/image";

<ImageRoot variant="muted" size="lg">
  <ImageZoom src="https://example.com/photo.jpg" alt="Photo">
    <ImagePreview src="https://example.com/photo.jpg" alt="Photo" />
  </ImageZoom>
  <ImageFilename>photo.jpg</ImageFilename>
</ImageRoot>
```

| Component        | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `Image`          | Default export, renders complete image part               |
| `Image.Root`     | Container with variant and size styling                   |
| `Image.Preview`  | Image container with loading/error states                 |
| `Image.Filename` | Optional filename display below image                     |
| `Image.Zoom`     | Medium-style zoom overlay (click to expand, ESC to close) |

## Related Components

- [Attachment](/docs/ui/attachment) - File attachments in composer and messages
- [File](/docs/ui/file) - Non-image file message parts
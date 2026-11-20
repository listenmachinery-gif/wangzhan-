import type { CSSProperties, ReactNode } from "react";

import { renderNodeContent } from "@/components/page-builder/renderers";
import { getComponentDefinition } from "@/lib/page-builder/registry";
import type {
  PageDocument,
  PageNode,
  PageStyle,
} from "@/lib/page-builder/schema";

function styleToCss(style: PageStyle | undefined): CSSProperties {
  if (!style) return {};
  return {
    width:
      style.width === "full"
        ? "100%"
        : style.width === "content"
          ? "fit-content"
          : style.width,
    maxWidth: style.maxWidth,
    minHeight: style.minHeight,
    marginTop: style.marginTop,
    marginBottom: style.marginBottom,
    paddingInline: style.paddingX,
    paddingBlock: style.paddingY,
    gap: style.gap,
    display: style.visible === false ? "none" : style.display,
    gridTemplateColumns: style.columns
      ? `repeat(${style.columns}, minmax(0, 1fr))`
      : undefined,
    alignItems:
      style.align === "start"
        ? "flex-start"
        : style.align === "end"
          ? "flex-end"
          : style.align,
    justifyContent:
      style.justify === "between"
        ? "space-between"
        : style.justify === "start"
          ? "flex-start"
          : style.justify === "end"
            ? "flex-end"
            : style.justify,
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundImage
      ? `url(${JSON.stringify(style.backgroundImage)})`
      : style.backgroundGradient
        ? `linear-gradient(${style.backgroundGradient.direction === "to-r" ? "90deg" : style.backgroundGradient.direction === "to-br" ? "135deg" : "180deg"}, ${style.backgroundGradient.from}, ${style.backgroundGradient.to})`
        : undefined,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth,
    borderStyle: style.borderWidth ? "solid" : undefined,
    borderRadius: style.borderRadius,
    boxShadow:
      style.shadow === "sm"
        ? "0 1px 3px rgb(0 0 0 / 0.12)"
        : style.shadow === "md"
          ? "0 8px 24px rgb(0 0 0 / 0.14)"
          : style.shadow === "lg"
            ? "0 20px 48px rgb(0 0 0 / 0.18)"
            : style.shadow === "none"
              ? "none"
              : undefined,
    fontFamily:
      style.fontFamily === "serif"
        ? "serif"
        : style.fontFamily === "mono"
          ? "monospace"
          : style.fontFamily === "sans"
            ? "sans-serif"
            : undefined,
    fontSize: style.fontSize,
    fontWeight:
      style.fontWeight === "medium"
        ? 500
        : style.fontWeight === "semibold"
          ? 600
          : style.fontWeight === "bold"
            ? 700
            : style.fontWeight,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    color: style.textColor,
    textAlign: style.textAlign,
    objectFit: style.objectFit,
    objectPosition: style.objectPosition,
    zIndex: style.zIndex,
  };
}

const unitlessProperties = new Set(["fontWeight", "lineHeight", "zIndex"]);

function styleToDeclarations(style: PageStyle | undefined) {
  return Object.entries(styleToCss(style))
    .filter(
      (entry): entry is [string, string | number] => entry[1] !== undefined,
    )
    .map(([property, value]) => {
      const cssProperty = property.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
      );
      const cssValue =
        typeof value === "number" && !unitlessProperties.has(property)
          ? `${value}px`
          : value;
      return `${cssProperty}:${cssValue}!important`;
    })
    .join(";");
}

function responsiveStyles(nodes: PageNode[]): string {
  const tablet: string[] = [];
  const mobile: string[] = [];
  const visit = (node: PageNode) => {
    const selector = `[data-page-node="${node.id}"]`;
    const tabletDeclarations = styleToDeclarations(node.responsive?.tablet);
    const mobileDeclarations = styleToDeclarations(node.responsive?.mobile);
    if (tabletDeclarations) tablet.push(`${selector}{${tabletDeclarations}}`);
    if (mobileDeclarations) mobile.push(`${selector}{${mobileDeclarations}}`);
    node.children?.forEach(visit);
  };
  nodes.forEach(visit);
  return [
    tablet.length ? `@media (min-width: 640px) and (max-width: 1023px){${tablet.join("")}}` : "",
    mobile.length ? `@media (max-width: 639px){${mobile.join("")}}` : "",
  ].join("");
}

/**
 * Utility classes on nested headings previously overrode the editor's wrapper styles.
 * Apply validated typography overrides to actual text elements, including per-device overrides.
 */
function typographyOverrides(nodes: PageNode[]): string {
  const desktop: string[] = [];
  const tablet: string[] = [];
  const mobile: string[] = [];
  const visit = (node: PageNode) => {
    const selector = `[data-page-node="${node.id}"] :is(h1,h2,h3,h4,h5,h6,p,li,span,summary)`;
    const build = (style?: PageStyle) => {
      if (!style) return "";
      const declarations = [
        style.textColor ? `color:${style.textColor}!important` : "",
        style.fontSize !== undefined ? `font-size:${style.fontSize}px!important` : "",
        style.fontWeight ? `font-weight:${{ normal: 400, medium: 500, semibold: 600, bold: 700 }[style.fontWeight]}!important` : "",
        style.fontFamily ? `font-family:${{ sans: "Arial,sans-serif", serif: "Georgia,serif", mono: "monospace" }[style.fontFamily]}!important` : "",
        style.lineHeight !== undefined ? `line-height:${style.lineHeight}!important` : "",
        style.letterSpacing !== undefined ? `letter-spacing:${style.letterSpacing}px!important` : "",
        style.textAlign ? `text-align:${style.textAlign}!important` : "",
      ].filter(Boolean);
      return declarations.length ? `${selector}{${declarations.join(";")}}` : "";
    };
    const base = build(node.style);
    if (base) desktop.push(base);
    const tab = build(node.responsive?.tablet);
    if (tab) tablet.push(tab);
    const mob = build(node.responsive?.mobile);
    if (mob) mobile.push(mob);
    node.children?.forEach(visit);
  };
  nodes.forEach(visit);
  return [
    desktop.join(""),
    tablet.length ? `@media(min-width:640px) and (max-width:1023px){${tablet.join("")}}` : "",
    mobile.length ? `@media(max-width:639px){${mobile.join("")}}` : "",
  ].join("");
}

function elementTypographyOverrides(nodes: PageNode[]): string {
  const rules: string[] = [];
  const visit = (node: PageNode) => {
    Object.entries(node.textStyles ?? {}).forEach(([key, style]) => {
      const declarations = [
        style.color ? `color:${style.color}!important` : "",
        style.fontSize !== undefined ? `font-size:${style.fontSize}px!important` : "",
        style.fontWeight ? `font-weight:${{ normal: 400, medium: 500, semibold: 600, bold: 700 }[style.fontWeight]}!important` : "",
        style.fontFamily ? `font-family:${{ sans: "Arial,sans-serif", serif: "Georgia,serif", mono: "monospace" }[style.fontFamily]}!important` : "",
        style.lineHeight !== undefined ? `line-height:${style.lineHeight}!important` : "",
        style.letterSpacing !== undefined ? `letter-spacing:${style.letterSpacing}px!important` : "",
        style.textAlign ? `text-align:${style.textAlign}!important` : "",
      ].filter(Boolean);
      if (declarations.length) {
        rules.push(`[data-page-node="${node.id}"] [data-page-text="${key}"]{${declarations.join(";")}}`);
      }
    });
    node.children?.forEach(visit);
  };
  nodes.forEach(visit);
  return rules.join("");
}

function renderNode(node: PageNode): ReactNode {
  const definition = getComponentDefinition(node.type);
  if (!definition) return null;
  const parsed = definition.contentSchema.safeParse(node.content);
  if (!parsed.success) return null;
  const children = node.children?.map((child) => (
    <Node key={child.id} node={child} />
  ));
  return renderNodeContent(
    node.type,
    parsed.data as Record<string, unknown>,
    children,
  );
}

function Node({ node }: { node: PageNode }) {
  const definition = getComponentDefinition(node.type);
  if (!definition) return null;
  const content = renderNode(node);
  if (content === null) return null;
  return (
    <div
      data-page-component={node.type}
      data-page-node={node.id}
      style={styleToCss(node.style)}
    >
      {content}
    </div>
  );
}

export function PageRenderer({ document }: { document: PageDocument }) {
  const nodes = Array.isArray(document?.nodes) ? document.nodes : [];
  const styles = responsiveStyles(nodes) + typographyOverrides(nodes) + elementTypographyOverrides(nodes);
  return (
    <>
      {styles ? <style>{styles}</style> : null}
      {nodes.map((node) => (
        <Node key={node.id} node={node} />
      ))}
    </>
  );
}

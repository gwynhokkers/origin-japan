/**
 * The Sections field is a one-column grid. A text box's longest line sets that
 * column, which pushes Add block past the edge of the editor. Pin the column
 * to the editor width instead.
 */
export const adminBlocksStyle = `<style id="origin-admin-blocks">
#field-sections { grid-template-columns: minmax(0, 1fr); }
#field-sections > * { min-width: 0; max-width: 100%; }
#field-sections textarea,
#field-sections input { min-width: 0; max-width: 100%; }
#field-sections img { max-width: 100%; height: auto; }
</style>`;

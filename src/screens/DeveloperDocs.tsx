import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { getScreenTitle } from '../config/screens.ts'
import { DocsNav } from '../components/developer/docs/DocsNav.tsx'
import { developerDocSections } from '../content/developerDocs/index.ts'
import { useDocSection } from '../hooks/useDocSection.ts'

export default function DeveloperDocs() {
  const { sectionId, selectSection } = useDocSection()
  const section = developerDocSections[sectionId]
  const SectionContent = section.render

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        maxWidth: 960,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        {getScreenTitle('devDocs')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        How to turn this shell into your own Airtable-backed Electron app. Pick a
        topic from the menu.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          flex: 1,
          minHeight: 0,
          gap: 2,
          mt: 2,
        }}
      >
        <DocsNav activeId={sectionId} onSelect={selectSection} />

        <Box
          component="article"
          sx={{ flex: 1, minWidth: 0, pb: 2 }}
          aria-labelledby="doc-section-title"
        >
          <Typography
            id="doc-section-title"
            variant="h6"
            component="h2"
            sx={{ fontWeight: 600, mb: 1.5 }}
          >
            {section.title}
          </Typography>
          <SectionContent />
        </Box>
      </Box>
    </Box>
  )
}

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import { DocSection } from '../../components/developer/docs/docPrimitives.tsx'

export function RunShipSection() {
  return (
    <DocSection title="Run & ship" hideTitle>
      <List dense disablePadding>
        <ListItem>
          <ListItemText
            primary="npm run electron:dev"
            secondary="Vite + Electron with hot reload."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="npm run build"
            secondary="Production renderer + Electron main/preload."
          />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText
            primary="npm run dist:mac / dist:win / dist:linux"
            secondary="Packaged installers via electron-builder (see package.json)."
          />
        </ListItem>
      </List>
    </DocSection>
  )
}

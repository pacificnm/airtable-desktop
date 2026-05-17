import HomeIcon from '@mui/icons-material/Home'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import TableChartIcon from '@mui/icons-material/TableChart'
import PaletteIcon from '@mui/icons-material/Palette'
import StyleIcon from '@mui/icons-material/Style'
import GridViewIcon from '@mui/icons-material/GridView'
import ExtensionIcon from '@mui/icons-material/Extension'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SecurityIcon from '@mui/icons-material/Security'
import SettingsIcon from '@mui/icons-material/Settings'
import PeopleIcon from '@mui/icons-material/People'
import NotificationsIcon from '@mui/icons-material/Notifications'
import type { SvgIconComponent } from '@mui/icons-material'
import type { MenuIconId } from '../../config/menu.ts'

export const menuIcons: Record<MenuIconId, SvgIconComponent> = {
  home: HomeIcon,
  tableChart: TableChartIcon,
  menuBook: MenuBookIcon,
  palette: PaletteIcon,
  style: StyleIcon,
  gridView: GridViewIcon,
  extension: ExtensionIcon,
  adminPanelSettings: AdminPanelSettingsIcon,
  security: SecurityIcon,
  settings: SettingsIcon,
  people: PeopleIcon,
  notifications: NotificationsIcon,
}

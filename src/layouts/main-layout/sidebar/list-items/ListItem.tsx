import { MenuItem } from 'routes/sitemap';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText, { listItemTextClasses } from '@mui/material/ListItemText';
import IconifyIcon from 'components/base/IconifyIcon';
import { useLocation } from 'react-router';

const ListItem = ({ subheader, icon, path, active }: MenuItem) => {
  // Styles based on the DNX template in the image (light theme)
  const buttonStyle = {
    mb: 1.5,
    borderRadius: 2.5,
    color: active ? '#1a1c1d' : '#7a829a',
    bgcolor: active ? '#f4f5f8' : 'transparent',
    '&:hover': {
      bgcolor: active ? '#f4f5f8' : 'rgba(0, 0, 0, 0.03)',
      color: '#1a1c1d',
      '& .MuiListItemIcon-root': { color: '#1a1c1d' },
    },
  };

  const iconStyle = {
    color: active ? '#1a1c1d' : '#9fa6bc',
  };

  const textStyle = {
    [`& .${listItemTextClasses.primary}`]: {
      color: active ? '#1a1c1d' : 'inherit',
      fontWeight: active ? 600 : 500,
    },
  };

  return (
    <ListItemButton
      component={Link}
      href={path}
      sx={buttonStyle}
    >
      <ListItemIcon sx={iconStyle}>
        {icon && (
          <IconifyIcon
            icon={icon}
          />
        )}
      </ListItemIcon>
      <ListItemText
        primary={subheader}
        sx={textStyle}
      />
    </ListItemButton>
  );
};

export default ListItem;

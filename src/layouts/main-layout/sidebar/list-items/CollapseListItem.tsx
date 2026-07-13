import { useState } from 'react';
import { MenuItem } from 'routes/sitemap';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText, { listItemTextClasses } from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import IconifyIcon from 'components/base/IconifyIcon';
import { useLocation } from 'react-router';

const CollapseListItem = ({ subheader, active, items, icon }: MenuItem) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

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
    <>
      <ListItemButton onClick={handleClick} sx={buttonStyle}>
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
        <IconifyIcon
          icon="iconamoon:arrow-down-2-duotone"
          sx={{
            color: active ? '#1a1c1d' : '#7a829a',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease-in-out',
          }}
        />
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items?.map((route) => {
            const subItemStyle = {
              ml: 1.5,
              mb: 0.5,
              borderRadius: 2,
              color: route.active ? '#1a1c1d' : '#7a829a',
              bgcolor: route.active ? '#f4f5f8' : 'transparent',
              '&:hover': {
                bgcolor: route.active ? '#f4f5f8' : 'rgba(0, 0, 0, 0.03)',
                color: '#1a1c1d',
              },
            };
            return (
              <ListItemButton
                key={route.pathName}
                component={Link}
                href={route.path}
                sx={subItemStyle}
              >
                <ListItemText
                  primary={route.name}
                  sx={{
                    [`& .${listItemTextClasses.primary}`]: {
                      color: route.active ? '#1a1c1d' : 'inherit',
                      fontWeight: route.active ? 600 : 500,
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Collapse>
    </>
  );
};

export default CollapseListItem;

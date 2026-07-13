import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

const FOOTER_SECTIONS = [
  {
    title: 'Shop and Learn',
    links: [
      { name: 'Store', href: '/' },
      { name: 'Mac', href: '/?category_name=Laptop' },
      { name: 'iPad', href: '/?category_name=Tablet' },
      { name: 'iPhone', href: '/?category_name=Smart Phone' },
      { name: 'Watch', href: '/?category_name=Smart Watch' },
      { name: 'AirPods', href: '/?category_name=Audio' },
    ],
  },
  {
    title: 'Account',
    links: [
      { name: 'Manage Your Apple ID', href: '#' },
      { name: 'Apple Store Account', href: '#' },
      { name: 'iCloud.com', href: '#' },
    ],
  },
  {
    title: 'Entertainment',
    links: [
      { name: 'Apple One', href: '#' },
      { name: 'Apple TV+', href: '#' },
      { name: 'Apple Music', href: '#' },
      { name: 'Apple Arcade', href: '#' },
    ],
  },
  {
    title: 'Apple Values',
    links: [
      { name: 'Accessibility', href: '#' },
      { name: 'Environment', href: '#' },
      { name: 'Privacy', href: '#' },
    ],
  },
];

const LEGAL_LINKS = [
  { name: 'Privacy Policy', href: '#' },
  { name: 'Terms of Use', href: '#' },
  { name: 'Sales and Refunds', href: '#' },
  { name: 'Legal', href: '#' },
  { name: 'Site Map', href: '#' },
];

const CustomerFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#f5f5f7',
        color: '#6e6e73',
        width: 1,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        borderTop: '1px solid #d2d2d7',
        pt: { xs: 4, md: 5 },
        pb: { xs: 4, md: 3 },
        px: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Box
        sx={{
          maxWidth: '980px',
          mx: 'auto',
          width: 1,
        }}
      >
        {/* Columns Grid */}
        <Grid container spacing={{ xs: 3, md: 2 }} sx={{ pb: { xs: 3, md: 4 } }}>
          {FOOTER_SECTIONS.map((section) => (
            <Grid item xs={12} sm={6} md={3} key={section.title}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: '#1d1d1f',
                  fontWeight: 600,
                  fontSize: '12px',
                  mb: 1.5,
                  letterSpacing: '-0.01em',
                }}
              >
                {section.title}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2, // ~10px spacing between links
                  alignItems: 'flex-start',
                }}
              >
                {section.links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    underline="hover"
                    sx={{
                      color: '#515154',
                      fontSize: '12px',
                      width: 'fit-content',
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: '#1d1d1f',
                      },
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Divider 1 */}
        <Divider sx={{ borderColor: '#d2d2d7', mb: 2 }} />

        {/* Middle text line */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontSize: '12px',
            lineHeight: 1.5,
            color: '#6e6e73',
            mb: 2,
          }}
        >
          More ways to shop:{' '}
          <Link
            href="/"
            underline="always"
            sx={{
              color: '#0066cc',
              mx: 0.5,
              '&:hover': {
                color: '#004499',
              },
            }}
          >
            Find an Apple Store
          </Link>{' '}
          or{' '}
          <Link
            href="/"
            underline="always"
            sx={{
              color: '#0066cc',
              mx: 0.5,
              '&:hover': {
                color: '#004499',
              },
            }}
          >
            other retailer
          </Link>{' '}
          near you. Or call 1800-1192.
        </Typography>

        {/* Divider 2 */}
        <Divider sx={{ borderColor: '#d2d2d7', mb: 2 }} />

        {/* Bottom copyright & legal links bar */}
        <Stack
          direction={{ xs: 'column-reverse', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={{ xs: 2, md: 0 }}
          sx={{ fontSize: '12px' }}
        >
          {/* Left copyright & links */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={{ xs: 1, sm: 2 }}
            flexWrap="wrap"
          >
            <Typography
              variant="caption"
              sx={{ color: '#6e6e73', fontSize: '12px' }}
            >
              Copyright © 2024 Apple Inc. All rights reserved.
            </Typography>

            {/* Separator and Legal Links Stack for desktop, and wraps correctly on mobile */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{
                color: '#6e6e73',
              }}
            >
              {LEGAL_LINKS.map((link, idx) => (
                <Stack direction="row" spacing={1} alignItems="center" key={link.name}>
                  {idx > 0 && (
                    <Box
                      component="span"
                      sx={{
                        color: '#d2d2d7',
                        fontSize: '11px',
                        userSelect: 'none',
                      }}
                    >
                      |
                    </Box>
                  )}
                  <Link
                    href={link.href}
                    underline="hover"
                    sx={{
                      color: '#515154',
                      fontSize: '12px',
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: '#1d1d1f',
                      },
                    }}
                  >
                    {link.name}
                  </Link>
                </Stack>
              ))}
            </Stack>
          </Stack>

          {/* Right location */}
          <Link
            href="#"
            underline="hover"
            sx={{
              color: '#515154',
              fontSize: '12px',
              transition: 'color 0.2s ease',
              alignSelf: { xs: 'flex-end', md: 'center' },
              '&:hover': {
                color: '#1d1d1f',
              },
            }}
          >
            Vietnam
          </Link>
        </Stack>
      </Box>
    </Box>
  );
};

export default CustomerFooter;

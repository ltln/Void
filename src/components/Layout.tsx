import React, { useState } from 'react';
import { Button, MenuItem, IconButton, Icon, HStack, useColorMode, Spacer, Menu, MenuList, MenuButton, useDisclosure, Skeleton } from '@chakra-ui/react';
import { Sun, Moon, Upload, Home, File, Users, User, Edit, LogOut, Tool } from 'react-feather';
import Navigation from './Navigation';
import ShareXDialog from './ShareXDialog';
import Link from 'next/link';
import ManageAccountDialog from './ManageAccountDialog';
import { useRouter } from 'next/router';
import MediaQuery from 'react-responsive';

export default function Layout({ children, id, user }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const { onClose: onShareXClose, isOpen: shareXOpen, onOpen: onShareXOpen } = useDisclosure();
  const { onClose: onManageClose, isOpen: manageOpen, onOpen: onManageOpen } = useDisclosure();
  const logout = async () => {
    setBusy(true);
    const userRes = await fetch('/api/user');
    if (userRes.ok) {
      const res = await fetch('/api/auth/logout');
      if (res.ok) router.push('/auth/login');
    } else {
      router.push('/auth/login');
    }
  };
  const pages = [
    {
      icon: Home,
      label: 'Dashboard',
      route: '/dash'
    },
    {
      icon: File,
      label: 'Files',
      route: '/dash/files'
    },
    {
      icon: Upload,
      label: 'Upload',
      route: '/dash/upload'
    },
    {
      icon: Users,
      label: 'Users',
      route: '/dash/users'
    }
  ];
  return (
    <>
      {busy ? (
        <Skeleton r={4} l={4} t={4} b={4} height='96%' width='98%' m={4} pos='fixed'/>
      ) : (
        <>
          <Navigation>
            <HStack align='left'>
              {pages.map((page, i) => (
                <>
                  <MediaQuery minWidth={640}>
                    <Link key={i} href={page.route} passHref>
                      <Button justifyContent='flex-start' colorScheme='purple' isActive={i === id} variant='ghost' leftIcon={<Icon as={page.icon}/>}>{page.label}</Button>
                    </Link>
                  </MediaQuery>
                  <MediaQuery maxWidth={640}>
                    <Link key={i} href={page.route} passHref>
                      <IconButton colorScheme='purple' aria-label={page.label} isActive={i === id} variant='ghost' icon={<Icon as={page.icon}/>}>{page.label}</IconButton>
                    </Link>
                  </MediaQuery>
                </>
              ))}
              <Spacer/>
              <IconButton aria-label='Theme toggle' onClick={toggleColorMode} variant='solid' colorScheme='purple' icon={colorMode === 'light' ? <Moon size={20}/> : <Sun size={20}/>}/>
              <Menu>
                <MenuButton
                  as={Button}
                  aria-label='Options'
                  leftIcon={<User size={16}/>}
                >{user.username}</MenuButton>
                <MenuList>
                  <MenuItem icon={<Edit size={16}/>} onClick={onManageOpen}>
                    Manage account
                  </MenuItem>
                  <MenuItem icon={<Tool size={16}/>} onClick={onShareXOpen}>
                    ShareX config
                  </MenuItem>
                  <MenuItem icon={<LogOut size={16}/>} onClick={logout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Navigation>
          <ManageAccountDialog onClose={onManageClose} open={manageOpen} user={user}/>
          <ShareXDialog onClose={onShareXClose} open={shareXOpen} token={user.token}/>
          {children}
        </>
      )}
    </>
  );
}
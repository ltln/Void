import {Autocomplete, Button, Stack, Text, TextInput} from '@mantine/core';
import {useClipboard, useDisclosure} from '@mantine/hooks';
import {showNotification} from '@mantine/notifications';
import CardGrid from 'components/CardGrid';
import ItemCard from 'components/ItemCard';
import Spoil from 'components/Spoil';
import ShortenDialog from 'dialogs/Shorten';
import useFetch from 'lib/hooks/useFetch';
import useQuery from 'lib/hooks/useQuery';
import {Permission} from 'lib/permission';
import {request} from 'lib/utils';
import dynamic from 'next/dynamic';
import {FiClipboard, FiExternalLink, FiScissors, FiSearch, FiTrash} from 'react-icons/fi';
import {RiDeleteBinFill, RiErrorWarningFill} from 'react-icons/ri';

const HiddenQR = dynamic(() => import('components/HiddenQR'));

export default function Page_URLs() {
  const {data, mutate} = useFetch('/api/user/urls');
  const {query, handler} = useQuery();
  const [opened, dHandler] = useDisclosure(false);
  const clipboard = useClipboard();
  const handleDelete = (id: string) => request({
    endpoint: '/api/user/urls',
    method: 'DELETE',
    body: {id},
    callback: () =>
      showNotification({
        title: 'Successfully deleted the URL.',
        icon: <RiDeleteBinFill/>,
        message: '',
        color: 'green'
      }),
    onError: e => showNotification({
      title: 'Failed to delete the URL.',
      message: e,
      color: 'red',
      icon: <RiErrorWarningFill/>
    }),
    onDone: () => mutate()
  });
  return (
    <>
      <ShortenDialog opened={opened} onClose={dHandler.close} onShorten={() => mutate()}/>
      <Stack>
        <div style={{display: 'flex'}}>
          <Button leftIcon={<FiScissors/>} onClick={dHandler.open}>
            Shorten
          </Button>
          <TextInput ml='xs' style={{flex: 1}} icon={<FiSearch/>} placeholder='Search something' value={query}
            onChange={e => handler.set(e.target.value)}/>
        </div>
        <CardGrid itemSize={375}>
          {data && handler.filterList(data, ['short', 'destination']).map((url, i) =>
            <ItemCard key={i} actions={[
              {
                label: 'Copy to clipboard',
                color: 'green',
                icon: <FiClipboard/>,
                value: `${window.location.origin}/${url.short}`
              }, {
                label: 'Open in new tab',
                color: 'blue',
                icon: <FiExternalLink/>,
                action: () => window?.open(`/${url.short}`, '_blank')
              }, {
                label: 'Delete',
                color: 'red',
                icon: <FiTrash/>,
                action: () => handleDelete(url.id)
              }
            ]}>
              <div style={{display: 'flex', margin: 16}}>
                <HiddenQR value={`${window.location.origin}/${url.short}`}/>
                <div style={{flex: 1, marginLeft: 16}}>
                  <Text size='sm' weight={700}>
                    ID: {url.id}
                    <br/>
                    Created at: {new Date(url.createdAt).toLocaleString()}
                    <br/>
                    Destination: <Spoil url size='sm' style={{
                      maxWidth: 110,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {url.destination}
                    </Spoil>
                    <br/>
                    Views: {url.views}
                    <br/>
                    Has password: {url.password ? 'Yes' : 'No'}
                  </Text>
                </div>
              </div>
            </ItemCard>
          )}
        </CardGrid>
      </Stack>
    </>
  );
}

Page_URLs.title = 'URLs';
Page_URLs.authRequired = true;
Page_URLs.permission = Permission.SHORTEN;

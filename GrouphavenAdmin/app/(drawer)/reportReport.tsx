import { Text, YStack, XStack, Image, Separator } from 'tamagui';
import { Dialog } from '@tamagui/dialog';
import React from 'react';

export default function RequestTable({ tableData }: { tableData: any[] }) {
  const [open, setOpen] = React.useState(false);
  const [selectedPhoto, setSelectedPhoto] = React.useState<string | null>(null);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { color: '$red10', fontWeight: '700' as const };
      case 'VERIFIED':
        return { color: '$green10', fontWeight: '700' as const };
      case 'REJECTED':
        return { color: '$orange10', fontWeight: '700' as const };
      default:
        return { color: '$gray10', fontWeight: '400' as const };
    }
  };

  return (
    <>
      {/* ✅ Modal Viewer */}
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content
            shadowColor="transparent"
            borderWidth={0}
            padding={0}
            width="30%"
            height="50%"
            backgroundColor="$backgroundTransparent"
            borderRadius="$4"
          >
            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto }}
                width="100%"
                height="100%"
                resizeMode="contain"
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      {/* ✅ Table */}
      <YStack bg="white" w={1800} borderRadius="$3" marginHorizontal={50} marginBottom={50}>
        <XStack paddingVertical="$3" ai="center" paddingLeft={50}>
          <YStack flex={2}><Text fontWeight="700">Request ID</Text></YStack>
          <YStack flex={1}><Text fontWeight="700">Status</Text></YStack>
          <YStack flex={1}><Text fontWeight="700">Photo</Text></YStack>
          <YStack flex={1}><Text fontWeight="700">Requested by</Text></YStack>
          <YStack flex={1}><Text fontWeight="700">Verified by</Text></YStack>
          <YStack flex={1}><Text fontWeight="700">Request Date</Text></YStack>
          <YStack flex={1}><Text fontWeight="700">Verification Date</Text></YStack>
        </XStack>
        <Separator />

        {tableData.length === 0 ? (
          <Text flex={1} textAlign="center" padding="$3" color="$gray10">
            No records found!
          </Text>
        ) : (
          tableData.map((item, i) => (
            <YStack key={i}>
              <XStack paddingVertical="$3" paddingLeft={50} alignItems="center">
                <YStack flex={2}>
                  <Text fontSize={14}>{item.id}</Text>
                </YStack>

                <YStack flex={1}>
                  <Text fontSize={14} {...getStatusStyles(item.status)}>
                    {item.status}
                  </Text>
                </YStack>

                <YStack flex={1}>
                  <Text
                    fontSize={14}
                    color="$blue10"
                    cursor="pointer"
                    textDecorationLine="underline"
                    w={80}
                    onPress={() => {
                      setSelectedPhoto(item.photo);
                      setOpen(true);
                    }}
                  >
                    View Photo
                  </Text>
                </YStack>

                <YStack flex={1}><Text fontSize={14}>{item.requestBy}</Text></YStack>
                <YStack flex={1}><Text fontSize={14}>{item.verifiedBy}</Text></YStack>
                <YStack flex={1}><Text fontSize={14}>{item.requestDate}</Text></YStack>
                <YStack flex={1}><Text fontSize={14}>{item.verifyDate}</Text></YStack>
              </XStack>
              <Separator />
            </YStack>
          ))
        )}
      </YStack>
    </>
  );
}

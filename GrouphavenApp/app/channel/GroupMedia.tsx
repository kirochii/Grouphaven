import { View, Text, StyleSheet, Pressable, FlatList, Image, Linking } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useChatContext } from 'stream-chat-expo';

const TABS = ['Images', 'Documents', 'Links'];

export default function GroupMedia() {
  const { cid } = useLocalSearchParams();
  const { client } = useChatContext();

  const [channel, setChannel] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState('Images');
  const [images, setImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<{ name: string; url: string }[]>([]);
  const [links, setLinks] = useState<string[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!cid || typeof cid !== 'string') return;
      const [type, id] = cid.split(':');
      const ch = client.channel(type, id);
      await ch.watch();
      setChannel(ch);

      const res = await ch.query({ messages: { limit: 100 } });
      const msgs = res.messages || [];

      const imgUrls: string[] = [];
      const docs: { name: string; url: string }[] = [];
      const extractedLinks: string[] = [];

      msgs.forEach((msg) => {
        const attachments = msg.attachments || [];

        attachments.forEach((att) => {
          if (att.type === 'image' && att.image_url) {
            imgUrls.push(att.image_url);
          } else if (att.type === 'file' && att.asset_url) {
            docs.push({ name: att.title || 'Document', url: att.asset_url });
          }
        });

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const foundLinks = msg.text?.match(urlRegex);
        if (foundLinks) {
          extractedLinks.push(...foundLinks);
        }
      });

      setImages(imgUrls);
      setDocuments(docs);
      setLinks(extractedLinks);
    };

    fetchMessages();
  }, [cid]);

    const renderTabContent = () => {
    switch (selectedTab) {
        case 'Images':
        return (
            <FlatList
            key="images" // <- important
            data={images}
            keyExtractor={(item, index) => `${item}-${index}`}
            numColumns={3}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.image} />
            )}
            ListEmptyComponent={<Text style={styles.empty}>No shared images</Text>}
            />
        );
        case 'Documents':
        return (
            <FlatList
            key="docs" // <- different key
            data={documents}
            keyExtractor={(item, index) => `${item.url}-${index}`}
            renderItem={({ item }) => (
                <Pressable onPress={() => Linking.openURL(item.url)} style={styles.docItem}>
                <Text style={styles.docName}>{item.name}</Text>
                </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No shared documents</Text>}
            />
        );
        case 'Links':
        return (
            <FlatList
            key="links" // <- different key
            data={links}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
                <Pressable onPress={() => Linking.openURL(item)} style={styles.linkItem}>
                <Text style={styles.linkText}>{item}</Text>
                </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No shared links</Text>}
            />
        );
        default:
        return null;
    }
    };

  return (
    <View style={styles.container}>
    <Stack.Screen
      options={{
        title: channel?.data?.name ?? 'Group Media',
      }}
    />
    
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tab, selectedTab === tab && styles.tabSelected]}
          >
            <Text style={selectedTab === tab ? styles.tabTextSelected : styles.tabText}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.contentContainer}>{renderTabContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabSelected: {
    borderBottomWidth: 2,
    borderBottomColor: 'black',
  },
  tabText: {
    color: '#888',
  },
  tabTextSelected: {
    color: 'black',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  grid: {
    gap: 8,
  },
  image: {
    width: '30%',
    aspectRatio: 1,
    margin: 5,
    borderRadius: 8,
  },
  docItem: {
    padding: 12,
    backgroundColor: '#f2f2f2',
    marginVertical: 6,
    borderRadius: 8,
  },
  docName: {
    color: '#333',
  },
  linkItem: {
    padding: 12,
    backgroundColor: '#e0f7fa',
    marginVertical: 6,
    borderRadius: 8,
  },
  linkText: {
    color: '#007AFF',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
});

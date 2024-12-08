import { Image, StyleSheet, Platform, View, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-native-paper';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lrryxyalvumuuvefxhrg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycnl4eWFsdnVtdXV2ZWZ4aHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NDI1MTUsImV4cCI6MjA0OTExODUxNX0.OPUCbJI_3ufrSJ7dX7PH6XCpL5jj8cn9dv9AwvX4y_c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


export default function HomeScreen() {
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchRecord = async () => {
      const { data, error } = await supabase
        .from('test') // Your table name
        .select('name') // Column you want to display
        .eq('id', 1) // Condition for the record
        .single(); // Fetch only one record

      if (data) {
        setName(data.name); // Save the name in the state
      } else {
        console.error('Error fetching record:', error.message);
      }
    };

    fetchRecord();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.recordText}>Name: {name}</Text>
      <Button mode="contained" onPress={() => console.log('Pressed')}>
        Press me
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    color: 'gray',
  },
  errorText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    color: 'red',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  recordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

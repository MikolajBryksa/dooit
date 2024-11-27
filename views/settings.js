import React from 'react';
import {View, ScrollView, Text, Pressable} from 'react-native';
import {styles} from '../styles';
import packageJson from '../package.json';
import ControlButton from '../components/ControlButton';

const Settings = () => {
  const dynamicStyle = ({pressed}) => [
    styles.tableItem,
    {opacity: pressed ? 0.8 : 1},
  ];

  function handlePress() {
    console.log('Settings');
  }

  function handleReset() {
    console.log('Settings');
  }

  function handleSupport() {
    console.log('Settings');
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.center}>Version {packageJson.version}</Text>
        </View>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.when}>Language</Text>
          <Text style={styles.what}>English</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.when}>Weight unit</Text>
          <Text style={styles.what}>kg</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.when}>Currency</Text>
          <Text style={styles.what}>zł</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.when}>Clock format</Text>
          <Text style={styles.what}>24h</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.when}>First day in calendar</Text>
          <Text style={styles.what}>Monday</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.when}>Max number of rows</Text>
          <Text style={styles.what}>90</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.when}>Habits tab</Text>
          <Text style={styles.what}>On</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.when}>Weights tab</Text>
          <Text style={styles.what}>On</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.when}>Costs tab</Text>
          <Text style={styles.what}>On</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.when}>Hours tab</Text>
          <Text style={styles.what}>On</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.when}>Plans tab</Text>
          <Text style={styles.what}>On</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.when}>Tasks tab</Text>
          <Text style={styles.what}>On</Text>
        </Pressable>
      </ScrollView>
      <View style={styles.controllers}>
        <ControlButton type="reset" press={handleReset} />
        <ControlButton type="support" press={handleSupport} />
      </View>
    </View>
  );
};

export default Settings;

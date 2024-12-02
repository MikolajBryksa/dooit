import React, {useState} from 'react';
import {View, ScrollView, Text, Pressable, Switch} from 'react-native';
import {COLORS, styles} from '../styles';
import packageJson from '../package.json';
import ControlButton from '../components/ControlButton';

const Settings = () => {
  const dynamicStyle = ({pressed}) => [
    styles.listItem,
    {opacity: pressed ? 0.8 : 1},
  ];

  const [habitsTab, setHabitsTab] = useState(true);
  const [weightsTab, setWeightsTab] = useState(true);
  const [costsTab, setCostsTab] = useState(true);
  const [hoursTab, setHoursTab] = useState(true);
  const [plansTab, setPlansTab] = useState(true);
  const [tasksTab, setTasksTab] = useState(true);

  function handlePress(name) {
    if (name === 'habits') {
      setHabitsTab(!habitsTab);
    } else if (name === 'weights') {
      setWeightsTab(!weightsTab);
    } else if (name === 'costs') {
      setCostsTab(!costsTab);
    } else if (name === 'hours') {
      setHoursTab(!hoursTab);
    } else if (name === 'plans') {
      setPlansTab(!plansTab);
    } else if (name === 'tasks') {
      setTasksTab(!tasksTab);
    }
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
          <Text style={styles.listItemWhat}>Language</Text>
          <Text style={styles.listItemChange}>English</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.listItemWhat}>Weight unit</Text>
          <Text style={styles.listItemChange}>kg</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.listItemWhat}>Currency</Text>
          <Text style={styles.listItemChange}>zł</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.listItemWhat}>Clock format</Text>
          <Text style={styles.listItemChange}>24h</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.listItemWhat}>First day in calendar</Text>
          <Text style={styles.listItemChange}>Monday</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress()}>
          <Text style={styles.listItemWhat}>Max number of rows</Text>
          <Text style={styles.listItemChange}>90</Text>
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress('habits')}>
          <Text style={styles.listItemWhat}>Habits tab</Text>
          <Switch
            style={styles.switch}
            value={habitsTab}
            onValueChange={() => handlePress('habits')}
            trackColor={{
              false: COLORS.primary25,
              true: COLORS.primary50,
            }}
            thumbColor={COLORS.primary}
          />
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress('weights')}>
          <Text style={styles.listItemWhat}>Weights tab</Text>
          <Switch
            style={styles.switch}
            value={weightsTab}
            onValueChange={() => handlePress('weights')}
            trackColor={{
              false: COLORS.primary25,
              true: COLORS.primary50,
            }}
            thumbColor={COLORS.primary}
          />
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress('costs')}>
          <Text style={styles.listItemWhat}>Costs tab</Text>
          <Switch
            style={styles.switch}
            value={costsTab}
            onValueChange={() => handlePress('costs')}
            trackColor={{
              false: COLORS.primary25,
              true: COLORS.primary50,
            }}
            thumbColor={COLORS.primary}
          />
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress('hours')}>
          <Text style={styles.listItemWhat}>Hours tab</Text>
          <Switch
            style={styles.switch}
            value={hoursTab}
            onValueChange={() => handlePress('hours')}
            trackColor={{
              false: COLORS.primary25,
              true: COLORS.primary50,
            }}
            thumbColor={COLORS.primary}
          />
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress('plans')}>
          <Text style={styles.listItemWhat}>Plans tab</Text>
          <Switch
            style={styles.switch}
            value={plansTab}
            onValueChange={() => handlePress('plans')}
            trackColor={{
              false: COLORS.primary25,
              true: COLORS.primary50,
            }}
            thumbColor={COLORS.primary}
          />
        </Pressable>
        <Pressable style={dynamicStyle} onPress={() => handlePress('tasks')}>
          <Text style={styles.listItemWhat}>Tasks tab</Text>
          <Switch
            style={styles.switch}
            value={tasksTab}
            onValueChange={() => handlePress('tasks')}
            trackColor={{
              false: COLORS.primary25,
              true: COLORS.primary50,
            }}
            thumbColor={COLORS.primary}
          />
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

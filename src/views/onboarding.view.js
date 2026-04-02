import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import {Text, Button, TextInput, Checkbox, useTheme} from 'react-native-paper';
import HabitComponent from '@/components/habit.component';
import EditModal from '@/modals/edit.modal';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {updateSettingValue} from '@/services/settings.service';
import {getLocalDateKey} from '@/utils';
import {setSettings, setHabits} from '@/redux/actions';
import {
  createDefaultHabit,
  getHabits,
  deleteHabit,
  getHabitById,
} from '@/services/habits.service';
import {requestNotificationPermission} from '@/services/notifications.service';
import {habitIcons} from '@/constants';
import AddModal from '@/modals/add.modal';
import SettingComponent from '@/components/setting.component';
import TermsDialog from '@/dialogs/terms.dialog';
import TipComponent from '@/components/tip.component';

const OnboardingView = ({setShowOnboarding}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);
  const habits = useSelector(state => state.habits);
  const [step, setStep] = useState(1);
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [name, setName] = useState('');
  const [visibleAddModal, setVisibleAddModal] = useState(false);
  const [selectedCustomHabits, setSelectedCustomHabits] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [visibleTermsDialog, setVisibleTermsDialog] = useState(false);
  const theme = useTheme();

  const [selectedHabits, setSelectedHabits] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
  });

  // Initialize state from existing habits if user returns to onboarding
  useEffect(() => {
    if (settings?.userName) {
      setName(settings.userName);
    }

    const existingHabits = getHabits() || [];

    const restoredSelection = {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
    };
    existingHabits.forEach(habit => {
      if (habit.id >= 1 && habit.id <= 7) {
        restoredSelection[habit.id] = true;
      }
    });
    setSelectedHabits(restoredSelection);
  }, [settings]);

  function handleStep1() {
    let updatedSettings = {...settings};
    if (name.trim()) {
      updateSettingValue('userName', name.trim());
      updatedSettings = {...updatedSettings, userName: name.trim()};
    }
    dispatch(setSettings(updatedSettings));
    setStep(2);
  }

  const fetchAllHabits = () => {
    const updatedHabits = getHabits() || [];
    dispatch(setHabits(updatedHabits));
    setSelectedCustomHabits(prev => {
      const next = {...prev};
      updatedHabits.filter(h => h.id > 7).forEach(h => {
        if (next[h.id] === undefined) next[h.id] = true;
      });
      return next;
    });
  };

  function handleHabitToggle(habitId) {
    setSelectedHabits(prev => ({
      ...prev,
      [habitId]: !prev[habitId],
    }));
  }

  const handleEditModal = (habitId, field, value, label) => {
    setEditModalData({habitId, field, value, label});
    setVisibleEditModal(true);
  };

  const closeEditModal = () => {
    setTimeout(() => {
      setVisibleEditModal(false);
    }, 100);
  };

  function handleStep2() {
    [1, 2, 3, 4, 5, 6, 7].forEach(habitId => {
      const isSelected = selectedHabits[habitId];
      const existingHabit = getHabitById(habitId);

      if (isSelected && !existingHabit) {
        createDefaultHabit(habitId);
      } else if (!isSelected && existingHabit) {
        deleteHabit(habitId);
      }
    });

    const updatedHabits = getHabits() || [];
    dispatch(setHabits(updatedHabits));
    setStep(3);
  }

  function handleStep3() {
    Object.entries(selectedCustomHabits).forEach(([id, selected]) => {
      if (!selected) deleteHabit(Number(id));
    });
    dispatch(setHabits(getHabits() || []));
    const updatedSettings = updateSettingValue('onboardingDate', getLocalDateKey());
    if (updatedSettings) dispatch(setSettings(updatedSettings));
    requestNotificationPermission(settings, dispatch, setSettings);
    setShowOnboarding(false);
  }

  const customHabits = habits.filter(h => h.id > 7);
  const hasSelectedHabits = Object.values(selectedHabits).some(Boolean);
  const canProceedStep2 =
    hasSelectedHabits || customHabits.some(h => selectedCustomHabits[h.id]);

  if (step === 1) {
    return (
      <View style={[styles.container, styles.center]}>
        <View style={styles.onboarding__bar}>
          <Text variant="headlineMedium">{t('onboarding.step1.title')}</Text>
          <Text variant="bodyLarge">{t('onboarding.step1.subtitle')}</Text>
        </View>

        <TextInput
          mode="outlined"
          style={styles.onboarding__input}
          placeholder={t('onboarding.step1.name')}
          value={name}
          onChangeText={setName}
          maxLength={30}
        />

        <TouchableOpacity
          onPress={() => setTermsAccepted(v => !v)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '80%',
            marginBottom: 8,
          }}>
          <Checkbox
            status={termsAccepted ? 'checked' : 'unchecked'}
            onPress={() => setTermsAccepted(v => !v)}
          />
          <Text variant="bodySmall">
            {t('onboarding.step1.terms-prefix')}{' '}
            <Text
              variant="bodySmall"
              onPress={() => setVisibleTermsDialog(true)}
              style={{
                color: theme.colors.primary,
                textDecorationLine: 'underline',
              }}>
              {t('onboarding.step1.terms-link')}
            </Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.onboarding__bar}>
          <Button
            mode="contained"
            onPress={handleStep1}
            disabled={!name.trim() || !termsAccepted}
            icon={!name.trim() || !termsAccepted ? 'lock' : 'check'}>
            {t('button.save')}
          </Button>
        </View>

        <TermsDialog
          visible={visibleTermsDialog}
          onDismiss={() => setVisibleTermsDialog(false)}
        />
      </View>
    );
  } else if (step === 2) {
    return (
      <View style={styles.onboarding__container}>
        <View style={styles.onboarding__bar}>
          <Text variant="headlineMedium">{t('onboarding.step2.choose')}</Text>
          <Text variant="bodyLarge">{t('onboarding.step2.which-habits')}</Text>
        </View>

        <ScrollView style={styles.container}>
          <TipComponent tipId="onboarding_habit_mindset">
            {t('tip.onboarding-habit-mindset')}
          </TipComponent>
          {[1, 2, 3, 4, 5, 6, 7].map(habitId => (
            <View
              key={habitId}
              style={{opacity: selectedHabits[habitId] ? 1 : 0.6}}>
              <SettingComponent
                label={t(`default-habits.${habitId}.habitName`)}
                leftIcon={habitIcons[habitId - 1]}
                checkboxValue={selectedHabits[habitId]}
                onCheckboxToggle={() => handleHabitToggle(habitId)}
                onPress={() => handleHabitToggle(habitId)}
                showChip={false}
              />
            </View>
          ))}
          {customHabits.map(habit => (
            <View
              key={habit.id}
              style={{opacity: selectedCustomHabits[habit.id] ? 1 : 0.6}}>
              <SettingComponent
                label={habit.habitName}
                leftIcon={habit.icon}
                checkboxValue={!!selectedCustomHabits[habit.id]}
                onCheckboxToggle={() =>
                  setSelectedCustomHabits(prev => ({
                    ...prev,
                    [habit.id]: !prev[habit.id],
                  }))
                }
                onPress={() =>
                  setSelectedCustomHabits(prev => ({
                    ...prev,
                    [habit.id]: !prev[habit.id],
                  }))
                }
                showChip={false}
              />
            </View>
          ))}
          <View style={styles.gap} />
        </ScrollView>

        <View style={styles.onboarding__bar}>
          <View style={styles.buttons}>
            <Button
              mode="outlined"
              icon="arrow-left"
              onPress={() => setStep(1)}>
              {t('button.back')}
            </Button>
            <Button
              mode="outlined"
              icon="plus"
              onPress={() => setVisibleAddModal(true)}>
              {t('button.add')}
            </Button>
            <Button
              mode="contained"
              icon={!canProceedStep2 ? 'lock' : 'check'}
              disabled={!canProceedStep2}
              onPress={handleStep2}>
              {t('button.save')}
            </Button>
          </View>
        </View>

        <EditModal
          visible={visibleEditModal}
          onDismiss={closeEditModal}
          field={editModalData?.field}
          value={editModalData?.value}
          label={editModalData?.label}
          habitId={editModalData?.habitId}
          fetchAllHabits={fetchAllHabits}
          onboardingMode={true}
        />

        <AddModal
          visible={visibleAddModal}
          onDismiss={() => setVisibleAddModal(false)}
          fetchAllHabits={fetchAllHabits}
        />
      </View>
    );
  } else if (step === 3) {
    return (
      <View style={styles.onboarding__container}>
        <View style={styles.onboarding__bar}>
          <Text variant="headlineMedium">
            {t('onboarding.step3.select-repetition')}
          </Text>
          <Text variant="bodyLarge">
            {t('onboarding.step3.accept-default')}
          </Text>
        </View>

        <ScrollView style={styles.container}>
          <TipComponent tipId="onboarding_same_time">
            {t('tip.onboarding-same-time')}
          </TipComponent>
          {habits
            .filter(h => h.id <= 7 || selectedCustomHabits[h.id])
            .map(habit => (
            <HabitComponent
              key={habit.id}
              id={habit.id}
              habitName={habit.habitName}
              repeatDays={habit.repeatDays}
              repeatHours={habit.repeatHours}
              icon={habit.icon}
              goal={habit.goal}
              fetchAllHabits={fetchAllHabits}
              onEdit={handleEditModal}
              onboardingMode={true}
            />
          ))}
          <View style={styles.gap} />
        </ScrollView>

        <View style={styles.onboarding__bar}>
          <View style={styles.buttons}>
            <Button
              mode="outlined"
              icon="arrow-left"
              onPress={() => {
                const currentHabits = getHabits() || [];
                const updatedSelectedHabits = {
                  1: false,
                  2: false,
                  3: false,
                  4: false,
                  5: false,
                  6: false,
                  7: false,
                };
                currentHabits.forEach(habit => {
                  if (habit.id >= 1 && habit.id <= 7) {
                    updatedSelectedHabits[habit.id] = true;
                  }
                });
                setSelectedHabits(updatedSelectedHabits);
                dispatch(setHabits(currentHabits));
                setStep(2);
              }}>
              {t('button.back')}
            </Button>
            <Button
              mode="outlined"
              icon="plus"
              onPress={() => setVisibleAddModal(true)}>
              {t('button.add')}
            </Button>
            <Button mode="contained" onPress={handleStep3} icon="check">
              {t('button.save')}
            </Button>
          </View>
        </View>

        <EditModal
          visible={visibleEditModal}
          onDismiss={closeEditModal}
          field={editModalData?.field}
          value={editModalData?.value}
          label={editModalData?.label}
          habitId={editModalData?.habitId}
          fetchAllHabits={fetchAllHabits}
          onboardingMode={true}
        />

        <AddModal
          visible={visibleAddModal}
          onDismiss={() => setVisibleAddModal(false)}
          fetchAllHabits={fetchAllHabits}
        />
      </View>
    );
  }
};

export default OnboardingView;

import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {View, ScrollView} from 'react-native';
import {Appbar, Text, Card, Chip} from 'react-native-paper';
import HabitCard from '@/components/habit.card';
import AddModal from '@/modals/add.modal';
import {getHabits} from '@/services/habits.service';
import {setHabits} from '@/redux/actions';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';

const HabitsView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const habits = useSelector(state => state.habits);
  const [visibleAddModal, setVisibleAddModal] = useState(false);

  const handleAddModal = () => {
    setVisibleAddModal(!visibleAddModal);
  };

  const fetchAllHabits = () => {
    const habits = getHabits() || [];
    dispatch(setHabits(habits));
  };

  useEffect(() => {
    fetchAllHabits();
  }, []);

  return (
    <>
      <Appbar.Header style={styles.topBar__shadow}>
        <Appbar.Content title={t('view.habits')} />

        <Appbar.Action
          icon="plus"
          onPress={() => {
            handleAddModal();
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        {habits && habits.length > 0 ? (
          habits.map(habit => (
            <HabitCard
              key={habit.id}
              id={habit.id}
              habitName={habit.habitName}
              habitEnemy={habit.habitEnemy}
              score={habit.score}
              level={habit.level}
              repeatDays={habit.repeatDays}
              repeatHours={habit.repeatHours}
              available={habit.available}
              fetchAllHabits={fetchAllHabits}
            />
          ))
        ) : (
          <Card style={styles.card}>
            <Card.Content style={styles.card__title}>
              <Text variant="titleMedium">{t('title.no-habits')}</Text>
              <Chip
                icon="plus"
                mode="outlined"
                onPress={handleAddModal}
                style={styles.chip}>
                {t(`title.add`)}
              </Chip>
            </Card.Content>
          </Card>
        )}
        <View style={styles.gap} />
      </ScrollView>

      <AddModal
        visible={visibleAddModal}
        onDismiss={handleAddModal}
        fetchAllHabits={fetchAllHabits}
      />
    </>
  );
};

export default HabitsView;

import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {View, ScrollView} from 'react-native';
import {Appbar} from 'react-native-paper';
import HabitCard from '@/components/habit.card';
import NoHabitsCard from '@/components/no-habits.card';
import AddModal from '@/modals/add.modal';
import EditModal from '@/modals/edit.modal';
import EqualizeDialog from '@/dialogs/equalize.dialog';
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
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [equalizeDialogVisible, setEqualizeDialogVisible] = useState(false);

  const handleAddModal = () => {
    setVisibleAddModal(!visibleAddModal);
  };

  const handleEditModal = (habitId, field, value, label) => {
    setEditModalData({habitId, field, value, label});
    setVisibleEditModal(true);
  };

  const closeEditModal = () => {
    setTimeout(() => {
      setVisibleEditModal(false);
    }, 100);
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
          icon="fire"
          onPress={() => setEqualizeDialogVisible(true)}
        />

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
              goodCounter={habit.goodCounter}
              badCounter={habit.badCounter}
              skipCounter={habit.skipCounter}
              repeatDays={habit.repeatDays}
              repeatHours={habit.repeatHours}
              available={habit.available}
              fetchAllHabits={fetchAllHabits}
              onEdit={handleEditModal}
            />
          ))
        ) : (
          <NoHabitsCard onAddHabit={handleAddModal} />
        )}
        <View style={styles.gap} />
      </ScrollView>

      <AddModal
        visible={visibleAddModal}
        onDismiss={handleAddModal}
        fetchAllHabits={fetchAllHabits}
      />

      <EditModal
        visible={visibleEditModal}
        onDismiss={closeEditModal}
        field={editModalData?.field}
        value={editModalData?.value}
        label={editModalData?.label}
        habitId={editModalData?.habitId}
        fetchAllHabits={fetchAllHabits}
      />

      <EqualizeDialog
        visible={equalizeDialogVisible}
        onDismiss={() => setEqualizeDialogVisible(false)}
        onDone={() => {
          setEqualizeDialogVisible(false);
          fetchAllHabits();
        }}
      />
    </>
  );
};

export default HabitsView;

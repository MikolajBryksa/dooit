import React, {useState, useEffect, useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {View, ScrollView} from 'react-native';
import HabitComponent from '@/components/habit.component';
import EmptyCard from '@/cards/empty.card';
import AddModal from '@/modals/add.modal';
import EditModal from '@/modals/edit.modal';
import FilterDialog from '@/dialogs/filter.dialog';
import {getHabits} from '@/services/habits.service';
import {setHabits} from '@/redux/actions';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import Topbar from '@/components/topbar.component';

const HabitsView = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const habits = useSelector(state => state.habits);
  const [visibleAddModal, setVisibleAddModal] = useState(false);
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [visibleFilterModal, setVisibleFilterModal] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [filterDay, setFilterDay] = useState('');

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

  const sortedHabits = useMemo(() => {
    if (!habits || habits.length === 0) return [];

    let filtered = habits;
    if (filterDay) {
      filtered = habits.filter(habit => habit.repeatDays.includes(filterDay));
    }

    return [...filtered].sort((a, b) => {
      const aFirstHour = a.repeatHours[0];
      const bFirstHour = b.repeatHours[0];
      return aFirstHour.localeCompare(bFirstHour);
    });
  }, [habits, filterDay]);

  useEffect(() => {
    fetchAllHabits();
  }, []);

  return (
    <>
      <Topbar>
        <Topbar.Content title={t('view.habits')} />
        <Topbar.Action
          icon={filterDay ? 'filter-check' : 'filter'}
          onPress={() => setVisibleFilterModal(true)}
        />
        <Topbar.Action
          icon="plus"
          onPress={() => {
            handleAddModal();
          }}
        />
      </Topbar>

      <ScrollView style={styles.container}>
        {sortedHabits && sortedHabits.length > 0 ? (
          sortedHabits.map(habit => (
            <HabitComponent
              key={habit.id}
              id={habit.id}
              habitName={habit.habitName}
              repeatDays={habit.repeatDays}
              repeatHours={habit.repeatHours}
              available={habit.available}
              icon={habit.icon}
              fetchAllHabits={fetchAllHabits}
              onEdit={handleEditModal}
            />
          ))
        ) : (
          <EmptyCard onAddHabit={handleAddModal} />
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

      <FilterDialog
        visible={visibleFilterModal}
        onDismiss={() => setVisibleFilterModal(false)}
        filterDay={filterDay}
        setFilterDay={setFilterDay}
      />
    </>
  );
};

export default HabitsView;

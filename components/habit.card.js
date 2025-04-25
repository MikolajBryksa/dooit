import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {
  Card,
  Button,
  Text,
  ProgressBar,
  Divider,
  Chip,
  Checkbox,
  DataTable,
  IconButton,
} from 'react-native-paper';
import ProgressTypeEnum from '../enum/progressType.enum';
import ViewEnum from '../enum/view.enum';
import {View} from 'react-native';
import SetHabitModal from '../modals/setHabit.modal';
import AddHabitModal from '../modals/addHabit.modal';
import DeleteHabitDialog from '../dialogs/deleteHabit.dialog';
import {formatSecondsToHHMMSS} from '../utils';
import {
  updateOrCreateProgress,
  deleteProgress,
} from '../services/progress.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';
import {getRepeatDaysString, timeStringToSeconds} from '../utils';

const HabitCard = ({
  view,
  id,
  habitName,
  firstStep,
  goalDesc,
  motivation,
  repeatDays = [],
  habitStart,
  progressType,
  progressUnit,
  targetScore,
  progress,
  inactive,
  fetchHabitsWithProgress,
}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const selectedDay = useSelector(state => state.selectedDay);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [selectedProgress, setSelectedProgress] = useState(null);
  const [progressBarValue, setProgressBarValue] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState('100%');
  const [isProgressing, setIsProgressing] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [startTime, setStartTime] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const currentHabit = {
    id,
    habitName,
    firstStep,
    goalDesc,
    motivation,
    repeatDays,
    habitStart,
    progressType,
    progressUnit,
    targetScore,
    progress,
  };

  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([7, 14, 30, 90]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0],
  );

  const from = page * itemsPerPage;
  let to;
  if (progress?.length > 0) {
    to = Math.min((page + 1) * itemsPerPage, progress.length);
  }

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  useEffect(() => {
    const progressArray = Array.isArray(progress) ? progress : [];
    const progressForSelectedDay = progressArray.find(
      item => new Date(item.date).toISOString().split('T')[0] === selectedDay,
    );

    if (progressForSelectedDay) {
      if (
        progressType === ProgressTypeEnum.AMOUNT &&
        progressForSelectedDay.progressAmount
      ) {
        setCurrentProgress(progressForSelectedDay.progressAmount);
      }
      if (
        progressType === ProgressTypeEnum.VALUE &&
        progressForSelectedDay.progressValue
      ) {
        setCurrentProgress(progressForSelectedDay.progressValue);
      }
      if (
        progressType === ProgressTypeEnum.TIME &&
        progressForSelectedDay.progressTime
      ) {
        setCurrentProgress(progressForSelectedDay.progressTime);
      }
      setChecked(progressForSelectedDay.checked);
    } else {
      setCurrentProgress(0);
      setChecked(false);
    }
  }, [progress, selectedDay, progressType]);

  const handleAdd = () => {
    if (progressType !== ProgressTypeEnum.TIME) {
      const newProgress = currentProgress + 1;
      setCurrentProgress(newProgress);
      saveData(newProgress, checked);
    }
    if (progressType === ProgressTypeEnum.TIME) {
      if (!startTime) {
        setStartTime(new Date());
        setIsProgressing(true);
        setProgressBarWidth('100%');
      } else {
        const endTime = new Date();
        const newProgress = (endTime - startTime) / 1000;
        const seconds = Math.round(currentProgress + newProgress);
        setCurrentProgress(seconds);
        saveData(seconds, checked);
        setStartTime(null);
        setIsProgressing(false);
      }
    }
  };

  const handleSet = sum => {
    const newProgress = parseFloat(sum || textInput);
    if (!isNaN(newProgress)) {
      if (progressType === ProgressTypeEnum.TIME) {
        setCurrentProgress(newProgress * 60);
        saveData(newProgress * 60);
      } else {
        setCurrentProgress(newProgress);
        saveData(newProgress);
      }
    }
    fetchHabitsWithProgress();
    setVisibleModal(false);
  };

  const handleRowPress = item => {
    setSelectedProgress(item);
    setTextInput(
      (
        item.progressAmount ??
        item.progressValue ??
        (item.progressTime && item.progressTime > 60
          ? item.progressTime / 60
          : 0) ??
        ''
      ).toString(),
    );
    setVisibleModal(!visibleModal);
  };

  const handleDeleteProgress = () => {
    if (selectedProgress?.id) {
      deleteProgress(selectedProgress.id);
      fetchHabitsWithProgress();
      setVisibleModal(false);
    }
  };

  const handleModal = () => {
    if (view === ViewEnum.PREVIEW) {
      const progressForSelectedDay = progress?.find(
        item => new Date(item.date).toISOString().split('T')[0] === selectedDay,
      );
      if (progressForSelectedDay) {
        setSelectedProgress(progressForSelectedDay);
      }
    }
    setVisibleModal(!visibleModal);
  };

  const handleDialog = () => {
    setVisibleDialog(!visibleDialog);
  };

  const updateProgressBar = () => {
    const progress = currentProgress / targetScore;
    setProgressBarValue(progress);

    if (progress > 1) {
      const progressPercentage =
        ((targetScore * 100) / currentProgress).toFixed(2) + '%';
      setProgressBarWidth(progressPercentage);
    } else {
      setProgressBarWidth('100%');
    }

    if (progressType === ProgressTypeEnum.TIME) {
      setTextInput(parseInt(currentProgress / 60).toString());
    } else {
      setTextInput(currentProgress.toString());
    }
  };

  useEffect(() => {
    updateProgressBar();
  }, [currentProgress, targetScore]);

  const saveData = (progress, checked) => {
    updateOrCreateProgress(
      id,
      selectedDay,
      progressType === ProgressTypeEnum.AMOUNT ? progress : null,
      progressType === ProgressTypeEnum.VALUE ? progress : null,
      progressType === ProgressTypeEnum.TIME ? progress : null,
      checked ?? false,
    );
  };

  const calculateAverageProgress = (progress, from, to) => {
    if (!progress || progress.length === 0) {
      return 0;
    }

    // Ograniczenie do elementów wyświetlanych w tabeli
    const visibleProgress = progress.slice(from, to);

    const total = visibleProgress.reduce((sum, item) => {
      const value =
        item.progressAmount ?? item.progressValue ?? item.progressTime ?? 0;
      return sum + value;
    }, 0);

    let result;
    if (progressType === ProgressTypeEnum.TIME) {
      result = total / visibleProgress.length;
      result = formatSecondsToHHMMSS(result); // Formatowanie na HH:MM:SS
    } else {
      result = total / visibleProgress.length;
      result = result.toFixed(2); // Zaokrąglenie do 2 miejsc po przecinku
    }
    return result;
  };

  const getChipIcon = (averageProgress, targetScore) => {
    if (progressType === ProgressTypeEnum.TIME) {
      targetScore = formatSecondsToHHMMSS(targetScore);
      targetScore = timeStringToSeconds(targetScore);
      averageProgress = timeStringToSeconds(averageProgress);
    } else {
      targetScore = parseFloat(targetScore);
      averageProgress = parseFloat(averageProgress);
    }
    if (averageProgress > targetScore) {
      return 'speedometer';
    } else if (averageProgress === targetScore) {
      return 'speedometer-medium';
    } else {
      return 'speedometer-slow';
    }
  };

  return (
    <>
      {(view === ViewEnum.PREVIEW || view === ViewEnum.STATS) && (
        <SetHabitModal
          visible={visibleModal}
          onDismiss={handleModal}
          habitName={habitName}
          progressType={progressType}
          progressUnit={progressUnit}
          textInput={textInput}
          setTextInput={setTextInput}
          handleSet={handleSet}
          handleDelete={handleDeleteProgress}
        />
      )}
      {view === ViewEnum.EDIT && (
        <AddHabitModal
          visible={visibleModal}
          onDismiss={handleModal}
          fetchHabitsWithProgress={() => fetchHabitsWithProgress()}
          currentHabit={currentHabit}
        />
      )}

      <DeleteHabitDialog
        visible={visibleDialog}
        onDismiss={handleDialog}
        onDone={() => {
          handleDialog();
          fetchHabitsWithProgress();
        }}
        habitId={id}
        habitName={habitName}
      />

      <Card
        style={[
          view === ViewEnum.PREVIEW && (checked || inactive) && !isOpen
            ? styles.cardChecked
            : styles.card,
        ]}
        onPress={() => setIsOpen(!isOpen)}>
        <Card.Content>
          <View style={styles.title}>
            <Text variant="titleLarge">{habitName}</Text>
            <View style={styles.rowActions}>
              {isOpen ? (
                <IconButton icon="chevron-up" />
              ) : (
                <IconButton icon="chevron-down" />
              )}
              {view === ViewEnum.PREVIEW && (
                <Checkbox
                  status={checked ? 'checked' : 'unchecked'}
                  onPress={() => {
                    {
                      !checked && setIsOpen(false);
                    }
                    setChecked(!checked);
                    saveData(currentProgress, !checked);
                  }}
                />
              )}
            </View>
          </View>

          {isOpen && (
            <>
              <Divider style={styles.divider} />

              {view !== ViewEnum.STATS && (
                <>
                  {view === ViewEnum.PREVIEW ? (
                    <Chip icon="clock" style={styles.chip}>
                      {habitStart} {inactive}
                    </Chip>
                  ) : (
                    <Chip icon="calendar" style={styles.chip}>
                      {habitStart} {getRepeatDaysString(repeatDays, t)}
                    </Chip>
                  )}
                  <Text variant="bodyMedium">
                    {t('card.first-step')}: {firstStep}
                  </Text>
                  <Text variant="bodyMedium">
                    {t('card.goal-desc')}: {goalDesc}
                  </Text>
                  <Text variant="bodyMedium">
                    {t('card.motivation')}: {motivation}
                  </Text>
                </>
              )}

              {view === ViewEnum.STATS && (
                <>
                  {progress && progress.length > 0 && (
                    <>
                      {progressType !== ProgressTypeEnum.DONE && (
                        <Chip
                          icon={getChipIcon(
                            calculateAverageProgress(progress, from, to),
                            targetScore,
                          )}
                          style={styles.chip}>
                          {t('table.average')}:{' '}
                          {calculateAverageProgress(progress, from, to)}{' '}
                          {progressUnit}{' '}
                        </Chip>
                      )}
                    </>
                  )}
                </>
              )}

              {view === ViewEnum.PREVIEW && (
                <>
                  {progressType !== ProgressTypeEnum.DONE && (
                    <>
                      <View style={styles.gap} />
                      {isProgressing ? (
                        <Text variant="bodyMedium">
                          {t('card.in-progress')}
                        </Text>
                      ) : (
                        <Text variant="bodyMedium">
                          {progressType === ProgressTypeEnum.TIME
                            ? `${formatSecondsToHHMMSS(
                                currentProgress,
                              )} / ${formatSecondsToHHMMSS(targetScore)}`
                            : `${currentProgress} / ${targetScore} ${progressUnit}`}
                        </Text>
                      )}

                      <View
                        style={[
                          styles.progressBar,
                          {
                            backgroundColor:
                              progressBarWidth !== '100%'
                                ? styles.progressExcess.color
                                : '',
                          },
                        ]}>
                        <ProgressBar
                          progress={progressBarValue}
                          indeterminate={isProgressing ? true : false}
                          style={{
                            width: progressBarWidth,
                          }}
                        />
                      </View>
                    </>
                  )}
                </>
              )}

              {progressType !== ProgressTypeEnum.DONE && (
                <Text variant="bodyMedium">
                  {t('card.target-measure')}:{' '}
                  {progressType === ProgressTypeEnum.TIME
                    ? formatSecondsToHHMMSS(targetScore)
                    : `${targetScore} ${progressUnit}`}
                </Text>
              )}

              {view === ViewEnum.STATS && (
                <>
                  {progress && progress.length > 0 ? (
                    <>
                      <DataTable>
                        <DataTable.Header>
                          <DataTable.Title>{t('table.date')}</DataTable.Title>
                          {progressType !== ProgressTypeEnum.DONE && (
                            <DataTable.Title numeric>
                              {t('table.measure')}
                            </DataTable.Title>
                          )}
                          <DataTable.Title numeric>
                            {t('table.day')}
                          </DataTable.Title>
                        </DataTable.Header>

                        {progress.slice(from, to).map((item, index) => (
                          <DataTable.Row
                            key={index}
                            onPress={() => handleRowPress(item)}>
                            <DataTable.Cell>
                              {new Date(item.date).toLocaleDateString('pl-PL')}
                            </DataTable.Cell>

                            {progressType !== ProgressTypeEnum.DONE && (
                              <DataTable.Cell numeric>
                                {item.progressAmount ??
                                  item.progressValue ??
                                  formatSecondsToHHMMSS(item.progressTime)}
                              </DataTable.Cell>
                            )}
                            <DataTable.Cell numeric>
                              {progress.length - from - index}
                            </DataTable.Cell>
                          </DataTable.Row>
                        ))}

                        <DataTable.Pagination
                          page={page}
                          numberOfPages={Math.ceil(
                            progress.length / itemsPerPage,
                          )}
                          onPageChange={page => setPage(page)}
                          label={`${from + 1}-${to} of ${progress.length}`}
                          numberOfItemsPerPageList={numberOfItemsPerPageList}
                          numberOfItemsPerPage={itemsPerPage}
                          onItemsPerPageChange={onItemsPerPageChange}
                        />
                      </DataTable>
                    </>
                  ) : (
                    <Text variant="bodyMedium" style={[styles.noProgress]}>
                      {t('table.no-progress')}
                    </Text>
                  )}
                </>
              )}
            </>
          )}
        </Card.Content>

        {isOpen && (
          <>
            {view === ViewEnum.PREVIEW && (
              <Card.Actions>
                {progressType !== ProgressTypeEnum.DONE && (
                  <Button
                    mode="outlined"
                    onPress={() => {
                      handleAdd();
                    }}>
                    {progressType === ProgressTypeEnum.TIME
                      ? startTime
                        ? t('button.stop')
                        : t('button.start')
                      : t('button.add')}
                  </Button>
                )}

                {progressType !== ProgressTypeEnum.DONE && (
                  <Button
                    onPress={() => {
                      handleModal();
                    }}>
                    {t('button.set')}
                  </Button>
                )}
              </Card.Actions>
            )}
            {view === ViewEnum.EDIT && (
              <Card.Actions>
                <Button
                  mode="outlined"
                  onPress={() => {
                    handleDialog();
                  }}>
                  {t('button.delete')}
                </Button>

                <Button
                  onPress={() => {
                    handleModal();
                  }}>
                  {t('button.edit')}
                </Button>
              </Card.Actions>
            )}
          </>
        )}
      </Card>
    </>
  );
};

export default HabitCard;

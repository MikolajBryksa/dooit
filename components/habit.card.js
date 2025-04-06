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
import {formatSecondsToMMSS} from '../utils';
import {updateOrCreateProgress} from '../services/progress.service';
import {useTranslation} from 'react-i18next';
import {useStyles} from '../styles';
import {getRepeatDaysString} from '../utils';

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
  const [progressBarValue, setProgressBarValue] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState('100%');
  const [isProgressing, setIsProgressing] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [startTime, setStartTime] = useState();
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

  const [showTable, setShowTable] = useState(false);
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

  const handleModal = () => {
    setVisibleModal(!visibleModal);
  };

  const handleDialog = () => {
    setVisibleDialog(!visibleDialog);
  };

  const handleSet = () => {
    const newProgress = parseFloat(textInput);
    if (!isNaN(newProgress)) {
      if (progressType === ProgressTypeEnum.TIME) {
        setCurrentProgress(newProgress * 60);
        saveData(newProgress * 60);
      } else {
        setCurrentProgress(newProgress);
        saveData(newProgress);
      }
    }
    setVisibleModal(false);
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

  if (checked && view === ViewEnum.PREVIEW) {
    return (
      <>
        <Card style={styles.cardChecked}>
          <Card.Content>
            <View style={styles.title}>
              <Text variant="titleLarge">{habitName}</Text>

              <Checkbox
                status={checked ? 'checked' : 'unchecked'}
                onPress={() => {
                  setChecked(!checked);
                  saveData(currentProgress, !checked);
                }}
              />
            </View>
          </Card.Content>
        </Card>
      </>
    );
  } else {
    return (
      <>
        {view === ViewEnum.PREVIEW ? (
          <SetHabitModal
            visible={visibleModal}
            onDismiss={handleModal}
            habitName={habitName}
            progressType={progressType}
            progressUnit={progressUnit}
            textInput={textInput}
            setTextInput={setTextInput}
            handleSet={handleSet}
          />
        ) : (
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

        <Card style={[styles.card, {opacity: inactive ? 0.5 : 1}]}>
          {view === ViewEnum.PREVIEW ? (
            <Chip icon="clock" style={styles.chip}>
              {habitStart}
            </Chip>
          ) : (
            <Chip icon="calendar" style={styles.chip}>
              {habitStart} {getRepeatDaysString(repeatDays, t)}
            </Chip>
          )}

          <Card.Content>
            <View style={styles.title}>
              <Text variant="titleLarge">{habitName}</Text>
              {view === ViewEnum.PREVIEW && (
                <Checkbox
                  status={checked ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setChecked(!checked);
                    saveData(currentProgress, !checked);
                  }}
                />
              )}
              {view === ViewEnum.STATS && showTable && (
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => {
                    setShowTable(false);
                  }}
                />
              )}
            </View>
            <Divider style={styles.divider} />

            {view !== ViewEnum.STATS && (
              <>
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

            {view === ViewEnum.PREVIEW && (
              <>
                {progressType !== ProgressTypeEnum.DONE && (
                  <>
                    <View style={styles.gap} />
                    {isProgressing ? (
                      <Text variant="bodyMedium">{t('card.in-progress')}</Text>
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

            {view !== ViewEnum.STATS &&
              progressType !== ProgressTypeEnum.DONE && (
                <Text variant="bodyMedium">
                  {t('card.target-measure')}:{' '}
                  {progressType === ProgressTypeEnum.TIME
                    ? formatSecondsToHHMMSS(targetScore)
                    : `${targetScore} ${progressUnit}`}
                </Text>
              )}

            {view === ViewEnum.STATS && showTable && (
              <>
                {progress && progress.length > 0 ? (
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title>{t('table.date')}</DataTable.Title>
                      {progressType !== ProgressTypeEnum.DONE ? (
                        <DataTable.Title numeric>
                          {t('table.measure')}
                        </DataTable.Title>
                      ) : (
                        <DataTable.Title numeric>
                          {t('table.day')}
                        </DataTable.Title>
                      )}
                      <DataTable.Title numeric>
                        {t('table.done')}
                      </DataTable.Title>
                    </DataTable.Header>

                    {progress.slice(from, to).map((item, index) => (
                      <DataTable.Row key={index}>
                        <DataTable.Cell>
                          {new Date(item.date).toLocaleDateString('pl-PL')}
                        </DataTable.Cell>

                        {progressType !== ProgressTypeEnum.DONE ? (
                          <DataTable.Cell numeric>
                            {item.progressAmount ??
                              item.progressValue ??
                              formatSecondsToMMSS(item.progressTime)}
                          </DataTable.Cell>
                        ) : (
                          <DataTable.Cell numeric>
                            {progress.length - from - index}
                          </DataTable.Cell>
                        )}

                        <DataTable.Cell numeric>
                          {item.checked ? t('table.yes') : t('table.no')}
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}

                    <DataTable.Pagination
                      page={page}
                      numberOfPages={Math.ceil(progress.length / itemsPerPage)}
                      onPageChange={page => setPage(page)}
                      label={`${from + 1}-${to} of ${progress.length}`}
                      numberOfItemsPerPageList={numberOfItemsPerPageList}
                      numberOfItemsPerPage={itemsPerPage}
                      onItemsPerPageChange={onItemsPerPageChange}
                    />
                  </DataTable>
                ) : (
                  <Text variant="bodyMedium" style={[styles.noProgress]}>
                    {t('table.no-progress')}
                  </Text>
                )}
              </>
            )}
          </Card.Content>

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
          {view === ViewEnum.STATS && !showTable && (
            <Card.Actions>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowTable(true);
                }}>
                {t('button.table')}
              </Button>
            </Card.Actions>
          )}
        </Card>
      </>
    );
  }
};

export default HabitCard;

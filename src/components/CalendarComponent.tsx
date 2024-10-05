import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const yearRange = Array.from({ length: 21 }, (_, i) => dayjs().year() - 10 + i);

const statusMapping = {
  1: { text: '上班中', class: 'working', detailedText: '上班中' },
  2: { text: '✔️', class: 'checked-in', detailedText: '已下班' },
  3: { text: '未打卡', class: 'absent', detailedText: '未打卡' },
  4: { text: '迟到', class: 'late', detailedText: '迟到' },
  5: { text: '早退', class: 'early-leave', detailedText: '早退' },
  6: { text: '迟到早退', class: 'late-early-leave', detailedText: '迟到且早退' }
};

const formatDate = (date) => date.format('YYYY-MM-DD');
const CalendarComponent = ({ attendanceRecords }) => {
    const [currentYear, setCurrentYear] = useState(dayjs().year());
    const [currentMonth, setCurrentMonth] = useState(dayjs().month());
    const [selectedDate, setSelectedDate] = useState(null);
    const [rippleDate, setRippleDate] = useState(null);
    const [signInStatus, setSignInStatus] = useState('');
    const [detailedStatus, setDetailedStatus] = useState('');
    const [todoList, setTodoList] = useState([]);
    const [view, setView] = useState('calendar');
    const [transitionName, setTransitionName] = useState('slide-left');
  
    const processedAttendanceRecords = useMemo(() => {
      return attendanceRecords.reduce((acc, record) => {
        acc[record.checkInDate] = record;
        return acc;
      }, {});
    }, [attendanceRecords]);
  
    const calendarDays = useMemo(() => {
      const days = [];
      const firstDay = dayjs(new Date(currentYear, currentMonth, 1));
      const lastDay = firstDay.endOf('month');
  
      for (let i = firstDay.day(); i > 0; i--) {
        days.push(firstDay.subtract(i, 'day'));
      }
  
      for (let i = 1; i <= lastDay.date(); i++) {
        days.push(dayjs(new Date(currentYear, currentMonth, i)));
      }
  
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        days.push(lastDay.add(i, 'day'));
      }
  
      return days.map(day => {
        const dateString = formatDate(day);
        const record = processedAttendanceRecords[dateString];
        return {
          date: day,
          record: record
        };
      });
    }, [currentYear, currentMonth, processedAttendanceRecords]);

  const selectedDateFormatted = useMemo(() => {
    if (!selectedDate) return '';
    return selectedDate.format('YYYY年MM月DD日');
  }, [selectedDate]);

  const getStatusMark = (record) => {
    if (!record) return '';
    if (record.isCheckIn === 1) return statusMapping[record.checkInStatus]?.text || '未知';
    return '';
  };

  const getCellClass = (day) => {
    const classes = ['calendar-cell'];
    if (isToday(day.date)) classes.push('today');
    if (isSelected(day.date)) classes.push('selected');
    if (!isCurrentMonth(day.date)) classes.push('other-month');
    if (day.date.isSame(rippleDate, 'day')) classes.push('ripple');
    if (day.record && day.record.isCheckIn === 1) {
      classes.push(statusMapping[day.record.checkInStatus]?.class || 'unknown');
    }
    return classes.join(' ');
  };

  const isToday = (date) => date.isSame(dayjs(), 'day');
  const isSelected = (date) => selectedDate && date.isSame(selectedDate, 'day');
  const isCurrentMonth = (date) => date.month() === currentMonth;
  

  const prevMonth = () => {
    const newDate = dayjs(new Date(currentYear, currentMonth, 1)).subtract(1, 'month');
    setCurrentYear(newDate.year());
    setCurrentMonth(newDate.month());
  };

  const nextMonth = () => {
    const newDate = dayjs(new Date(currentYear, currentMonth, 1)).add(1, 'month');
    setCurrentYear(newDate.year());
    setCurrentMonth(newDate.month());
  };

  const selectDate = (day) => {
    setSelectedDate(day.date);
    updateDetails(day);
  };

  const updateDetails = (day) => {
    const today = dayjs();
    if (day.date.isAfter(today)) {
      setSignInStatus('未来的日期，无法签到');
      setDetailedStatus('');
      setTodoList([]);
    } else {
      fetchDayDetails(day.record);
    }
    setTransitionName('slide-left');
    setView('details');

    setRippleDate(day.date);
    setTimeout(() => {
      setRippleDate(null);
    }, 500);
  };

  const fetchDayDetails = (record) => {
    if (record) {
      if (record.isCheckIn === 1) {
        setSignInStatus('已签到');
        setDetailedStatus(statusMapping[record.checkInStatus]?.detailedText || '未知状态');
      } else {
        setSignInStatus('未签到');
        setDetailedStatus(statusMapping[record.checkInStatus]?.detailedText || '未知状态');
      }
    } else {
      setSignInStatus('未签到');
      setDetailedStatus('');
    }
    setTodoList([
      '完成报告',
      '团队会议',
      '代码审查',
      '健身',
      '阅读'
    ].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1));
  };

  const goBackToCalendar = () => {
    setTransitionName('slide-right');
    setView('calendar');
  };

  const styles = {
    calendarContainer: {
      width: '100%',
      maxWidth: '600px',
      margin: 'auto',
      border: '1px solid #e2e8f0',
      borderRadius: '5px',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#4299e1',
      color: 'white',
      fontSize: '1.5em',
    },
    headerButton: {
      background: 'none',
      border: 'none',
      color: 'rgb(31, 24, 24)',
      fontSize: '1.5em',
      cursor: 'pointer',
      outline: 'none',
      transition: 'transform 0.2s',
    },
    headerSelectors: {
      display: 'flex',
      gap: '10px',
    },
    select: {
      background: 'transparent',
      border: 'none',
      color: 'rgb(8, 6, 6)',
      fontSize: '1em',
      cursor: 'pointer',
      appearance: 'none',
      padding: '5px 20px 5px 5px',
      borderRadius: '4px',
      transition: 'background-color 0.3s',
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1px',
      backgroundColor: '#e2e8f0',
      border: '1px solid #e2e8f0',
    },
    calendarCell: {
      backgroundColor: 'white',
      aspectRatio: '1 / 1',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '1.2em',
      cursor: 'pointer',
      transition: 'background-color 0.3s, color 0.3s',
    },
    weekday: {
      backgroundColor: '#4299e1',
      color: 'white',
      fontWeight: 'bold',
    },
    today: {
      backgroundColor: '#63b3ed',
      color: 'white',
      fontWeight: 'bold',
    },
    otherMonth: {
      color: '#a0aec0',
    },
    statusMark: {
      fontSize: '0.8em',
      marginLeft: '2px',
    },
    detailsContent: {
      padding: '20px',
    },
    backButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.2em',
      color: '#4299e1',
      cursor: 'pointer',
      padding: '10px 0',
      display: 'flex',
      alignItems: 'center',
      transition: 'color 0.3s',
    },
  };

  return (
    <div style={styles.calendarContainer}>
      <div style={styles.calendarHeader}>
        <button style={styles.headerButton} onClick={prevMonth}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div style={styles.headerSelectors}>
          <select
            style={styles.select}
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
          >
            {yearRange.map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
          <select
            style={styles.select}
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
        </div>
        <button style={styles.headerButton} onClick={nextMonth}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
      <div style={{ ...styles.viewContainer, transition: 'all 0.3s ease-out' }}>
        {view === 'calendar' ? (
          <div style={styles.calendarContent}>
            <div style={styles.calendarBody}>
              <div style={styles.calendarGrid}>
                {weekdays.map((day, index) => (
                  <div key={`weekday-${index}`} style={{ ...styles.calendarCell, ...styles.weekday }}>
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, i) => (
                  <div
                    key={`day-${i}`}
                    style={{
                      ...styles.calendarCell,
                      ...(isToday(day.date) && styles.today),
                      ...(isSelected(day.date) && styles.selected),
                      ...(!isCurrentMonth(day.date) && styles.otherMonth),
                    }}
                    onClick={() => selectDate(day)}
                  >
                    <div>
                      {day.date.date()}
                      {day.record && <span style={styles.statusMark}>{getStatusMark(day.record)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.detailsContent}>
            <button style={styles.backButton} onClick={goBackToCalendar}>
              <FontAwesomeIcon icon={faArrowLeft} /> 返回日历
            </button>
            <div style={styles.dayDetails}>
              <h3>{selectedDateFormatted} 的详情</h3>
              <p>签到状态: {signInStatus}</p>
              {detailedStatus && <p>具体状态: {detailedStatus}</p>}
              <p>待办事项:</p>
              <ul>
                {todoList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default CalendarComponent;
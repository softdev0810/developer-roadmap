import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import 'react-tooltip/dist/react-tooltip.css';
import { formatActivityDate } from '../../lib/date';
import type { UserActivityCount } from '../../api/user';
import dayjs from 'dayjs';

type UserActivityHeatmapProps = {
  activity: UserActivityCount;
};
export function UserActivityHeatmap(props: UserActivityHeatmapProps) {
  const { activity } = props;
  const data = Object.entries(activity.activityCount).map(([date, count]) => ({
    date,
    count,
  }));

  const startDate = dayjs().subtract(1, 'year').toDate();
  const endDate = dayjs().toDate();

  return (
    <>
      <h2 className="mb-4 text-xl font-bold">Activity</h2>
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={data}
        onClick={(value) => {
          console.log('-'.repeat(20));
          console.log('Clicked on value', value);
          console.log('-'.repeat(20));
        }}
        classForValue={(value) => {
          if (!value) {
            return 'fill-gray-100 rounded-md [rx:2px]';
          }

          const { count } = value;
          if (count >= 20) {
            return 'fill-gray-800 rounded-md [rx:2px]';
          } else if (count >= 10) {
            return 'fill-gray-600 rounded-md [rx:2px]';
          } else if (count >= 5) {
            return 'fill-gray-500 rounded-md [rx:2px]';
          } else if (count >= 3) {
            return 'fill-gray-300 rounded-md [rx:2px]';
          } else {
            return 'fill-gray-200 rounded-md [rx:2px]';
          }
        }}
        tooltipDataAttrs={(value: any) => {
          if (!value || !value.date) {
            return null;
          }

          const formattedDate = formatActivityDate(value.date);
          return {
            'data-tooltip-id': 'user-activity-tip',
            'data-tooltip-content': `${value.count} activities on ${formattedDate}`,
          };
        }}
      />

      <ReactTooltip
        id="user-activity-tip"
        className="!rounded-lg !bg-gray-900 !p-1 !px-2 !text-sm"
      />
    </>
  );
}

import React, { ReactNode } from "react";
import s from "./MyCalendar.module.scss";
import { useTheme } from "@common/atoms/Theme";
import { cnf, useStateObject } from "@common/utils";

import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.scss";
import moment from "moment";
//@ts-ignore
const DragAndDropCalendar = withDragAndDrop(Calendar);

export interface MyCalendarProps {
	children?: ReactNode | undefined;
}
const events = [
	{
		id: 0,
		title: "All Day Event very long title",
		allDay: true,
		start: new Date(2015, 3, 0),
		end: new Date(2015, 3, 1),
	},
];

const localizer = momentLocalizer(moment); // or globalizeLocalizer

const MyCalendar = ({ className, children, ...props }: MyCalendarProps & React.HTMLAttributes<HTMLDivElement>) => {
	const theme = useTheme().name;
	className = cnf(s, `comp`, theme, className);

	const [state, setState] = useStateObject({
		events: events,
		displayDragItemInCell: true,
	} as any);

	const handleDragStart = (event) => {
		setState({ draggedEvent: event });
	};

	const dragFromOutsideItem = () => {
		return state.draggedEvent;
	};

	const onDropFromOutside = ({ start, end, allDay }) => {
		const { draggedEvent } = state;

		const event = {
			id: draggedEvent.id,
			title: draggedEvent.title,
			start,
			end,
			allDay: allDay,
		};
		//@ts-ignore
		setState({ draggedEvent: null });
		//@ts-ignore
		moveEvent({ event, start, end });
	};

	const moveEvent = ({ event, start, end, isAllDay: droppedOnAllDaySlot }) => {
		const { events } = state;

		let allDay = event.allDay;

		if (!event.allDay && droppedOnAllDaySlot) {
			allDay = true;
		} else if (event.allDay && !droppedOnAllDaySlot) {
			allDay = false;
		}

		const nextEvents = events.map((existingEvent) => {
			return existingEvent.id == event.id ? { ...existingEvent, start, end, allDay } : existingEvent;
		});

		setState({
			events: nextEvents,
		});

		// alert(`${event.title} was dropped onto ${updatedEvent.start}`)
	};

	const resizeEvent = ({ event, start, end }) => {
		const { events } = state;

		const nextEvents = events.map((existingEvent) => {
			return existingEvent.id == event.id ? { ...existingEvent, start, end } : existingEvent;
		});

		setState({
			events: nextEvents,
		});

		//alert(`${event.title} was resized to ${start}-${end}`)
	};

	const newEvent = (_event) => {
		// let idList = this.state.events.map(a => a.id)
		// let newId = Math.max(...idList) + 1
		// let hour = {
		//   id: newId,
		//   title: 'New Event',
		//   allDay: event.slots.length == 1,
		//   start: event.start,
		//   end: event.end,
		// }
		// this.setState({
		//   events: this.state.events.concat([hour]),
		// })
	};

	return (
		<div className={className} {...props}>
			<DragAndDropCalendar
				selectable
				localizer={localizer}
				events={state.events}
				onEventDrop={moveEvent}
				resizable
				onEventResize={resizeEvent}
				onSelectSlot={newEvent}
				onDragStart={console.log}
				defaultView={Views.MONTH}
				defaultDate={new Date(2015, 3, 12)}
				popup={true}
				//@ts-ignore
				dragFromOutsideItem={state.displayDragItemInCell ? dragFromOutsideItem : null}
				onDropFromOutside={onDropFromOutside}
				handleDragStart={handleDragStart}
			/>
		</div>
	);
};

export default MyCalendar;

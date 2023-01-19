import Button from "@common/atoms/Button";
import Input from "@common/atoms/Form/Input";
import { QueryError, useObservable } from "@common/rxjs/rxjs_utils";
import { useApi_Policy, setApi_PolicyQuery } from "../rxjs/observables";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { interval, map, share, startWith, Subject } from "rxjs";

// A signal is an entry point to react-rxjs. It's equivalent to using a subject
const [textChange$, setText] = createSignal<string>();
// Bind creates hook that subscribes to observable
const [useText, text$] = bind<string>(textChange$, "");
const [useTextLength, textLength$] = bind<number>(text$.pipe(map((v) => v.length)), 0);

const int$ = interval(1000).pipe(share());
const [useInt, latestInt$] = bind(int$, 0);
// ---------------

// My useObservable
const subject = new Subject<number>();
const subjectString$ = subject.pipe(
	map((v) => `Hello World ${v}!`),
	startWith("World Empty!")
);
// ---------

const APITest = () => {
	const text = useText();
	const textLength = useTextLength();
	const int = useInt();
	const result = useApi_Policy();
	const subjectString = useObservable(subjectString$, undefined);

	return (
		<>
			<div style={{ display: "flex" }}>
				<div className='card'>
					<Input onChange={(e) => setText(e.target.value)} />
					<br />
					<span>You have input: {text}</span>
					<br />
					<span>The length of input: {textLength}</span>
					<span>A counter {int}</span>
				</div>
				<div className='card'>
					<Input id='api_test' />
					<br />
					<Button
						onClick={() => {
							const o = document.getElementById("api_test");
							// if (o) setPolicySubject(o["value"]);
							setApi_PolicyQuery({ pageSize: 10 });
						}}
					>
						Look for Policy
					</Button>
					<QueryError query={result} />
					<textarea value={JSON.stringify(result, undefined, 2)}></textarea>
				</div>
				<div className='card'>
					<Button
						onClick={() => {
							subject.next(Math.random() * 500);
						}}
					>
						Trigger Subject
					</Button>
					{subjectString}
				</div>
			</div>
		</>
	);
};
export default APITest;

/**
 * Renders the array returned by db.exec(...) as tables
 * @param {{results: Array.<import("sql.js").QueryExecResult>}} } props
 */
export default function ResultsTable({ results = [] }) {
	return (
		<pre>
			{results.map(({ columns, values }, i) => (
				<table
					key={i}
					className="table w-full"
					style={{ tableLayout: "fixed" }}
				>
					<thead className="capitalize">
						<tr>
							{columns.map((columnName, i) => {
								return (
									<th
										key={i}
										className="border-b border-red-50"
									>
										{columnName}
									</th>
								);
							})}
						</tr>
					</thead>

					<tbody>
						{
							// values is an array of arrays representing the results of the query
							values.map((row, i) => {
								return (
									<tr id={`row${row[0]}`} key={i}>
										{row.map((value, i) => {
											let renderValue = value;

											return (
												<td
													key={i}
													className="border-b border-divider"
												>
													<span className="w-full h-full block overflow-hidden text-ellipsis">
														{renderValue}
													</span>
												</td>
											);
										})}
									</tr>
								);
							})
						}
					</tbody>
				</table>
			))}
		</pre>
	);
}

import { Grid } from "@mantine/core";

interface DataViewGridProps<T> {
    data: T[];
    renderCard: (item: T) => React.ReactNode;
}

export default function DataViewGrid<T>({ data, renderCard }: DataViewGridProps<T>) {
    return (
        <Grid>
            {data.map((item, index) => (
                <Grid.Col 
                    key={index} 
                    span={{ base: 12, sm: 6, md: 4, lg: 3 }}
                >
                    {renderCard ? renderCard(item) : null}
                </Grid.Col>
            ))}
        </Grid>
    );
}